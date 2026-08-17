import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { assertResidenceAccess } from "@/lib/rbac";
import { appelChargesSchema } from "@/lib/validation";

// Crée un appel de charges et répartit automatiquement le montant entre les lots
// de la résidence au prorata des tantièmes de charges (section 6.4 du CDC).
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

    const budget = await prisma.budget.findUnique({
      where: { id: parsed.data.budgetId },
      select: { residenceId: true },
    });
    if (!budget) notFound("Budget introuvable.");
    await assertResidenceAccess(session, budget!.residenceId);

    const lots = await prisma.lot.findMany({
      where: { batiment: { residenceId: budget!.residenceId } },
      select: { id: true, tantiemesCharges: true },
    });
    const totalTantiemes = lots.reduce((sum, lot) => sum + lot.tantiemesCharges, 0);
    if (lots.length === 0 || totalTantiemes === 0) {
      return NextResponse.json(
        { error: "La résidence n'a aucun lot avec des tantièmes de charges définis." },
        { status: 422 }
      );
    }

    const appel = await prisma.$transaction(async (tx) => {
      const created = await tx.appelCharges.create({
        data: {
          budgetId: parsed.data.budgetId,
          periode: parsed.data.periode,
          dateEcheance: new Date(parsed.data.dateEcheance),
          montantTotal: parsed.data.montantTotal,
          statut: "PUBLIE",
        },
      });

      await tx.quotePart.createMany({
        data: lots.map((lot) => ({
          appelChargesId: created.id,
          lotId: lot.id,
          montant:
            Math.round(
              (parsed.data.montantTotal * lot.tantiemesCharges * 100) /
                totalTantiemes
            ) / 100,
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
