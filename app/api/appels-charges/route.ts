import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { assertResidenceAccess } from "@/lib/rbac";
import { appelChargesSchema } from "@/lib/validation";

// Crée un appel de charges et répartit le montant entre les lots de la résidence,
// soit au prorata des tantièmes de charges, soit en forfait — chaque lot a alors
// son propre montant forfaitaire (champ Lot.montantForfaitaire, souvent différent
// selon le type de lot), pratique courante au Maroc (section 6.4 du CDC).
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const body = await request.json().catch(() => null);
    const parsed = appelChargesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }
    const { repartition, montantTotal } = parsed.data;
    if (repartition === "TANTIEMES" && !montantTotal) {
      return NextResponse.json({ error: "Montant total requis." }, { status: 400 });
    }

    const budget = await prisma.budget.findUnique({
      where: { id: parsed.data.budgetId },
      select: { residenceId: true },
    });
    if (!budget) notFound("Budget introuvable.");
    await assertResidenceAccess(session, budget!.residenceId);

    const lots = await prisma.lot.findMany({
      where: { batiment: { residenceId: budget!.residenceId } },
      select: { id: true, numero: true, tantiemesCharges: true, montantForfaitaire: true },
    });
    if (lots.length === 0) {
      return NextResponse.json({ error: "La résidence n'a aucun lot." }, { status: 422 });
    }

    let quotePartsData: { lotId: string; montant: number }[];
    let appelMontantTotal: number;

    if (repartition === "FORFAIT") {
      const sansForfait = lots.filter((l) => l.montantForfaitaire == null);
      if (sansForfait.length > 0) {
        return NextResponse.json(
          {
            error: `Montant forfaitaire manquant pour : ${sansForfait
              .map((l) => l.numero)
              .join(", ")}. Renseignez-le sur chaque lot avant de créer l'appel.`,
          },
          { status: 422 }
        );
      }
      quotePartsData = lots.map((lot) => ({ lotId: lot.id, montant: lot.montantForfaitaire! }));
      appelMontantTotal = Math.round(quotePartsData.reduce((s, q) => s + q.montant, 0) * 100) / 100;
    } else {
      const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemesCharges, 0);
      if (totalTantiemes === 0) {
        return NextResponse.json(
          { error: "La résidence n'a aucun lot avec des tantièmes de charges définis." },
          { status: 422 }
        );
      }
      appelMontantTotal = montantTotal!;
      quotePartsData = lots.map((lot) => ({
        lotId: lot.id,
        montant: Math.round((montantTotal! * lot.tantiemesCharges * 100) / totalTantiemes) / 100,
      }));
    }

    const appel = await prisma.$transaction(async (tx) => {
      const created = await tx.appelCharges.create({
        data: {
          budgetId: parsed.data.budgetId,
          periode: parsed.data.periode,
          dateEcheance: new Date(parsed.data.dateEcheance),
          montantTotal: appelMontantTotal,
          statut: "PUBLIE",
        },
      });

      await tx.quotePart.createMany({
        data: quotePartsData.map((qp) => ({
          appelChargesId: created.id,
          lotId: qp.lotId,
          montant: qp.montant,
          statut: "EN_ATTENTE" as const,
        })),
      });

      return created;
    });

    return NextResponse.json(appel, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
