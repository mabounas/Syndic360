import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertLotAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { echeanceUpdateSchema } from "@/lib/validation";
import { genererEcheancier } from "@/lib/echeancier";

// Enregistre un paiement pour un lot sans préciser l'échéance exacte :
// applique le paiement à la plus ancienne échéance non payée du lot
// (comportement "Paiement reçu" — le syndic choisit le copropriétaire,
// pas le mois). Utilisé pour l'écran de saisie rapide sur Comptabilité.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: lotId } = await params;
    await assertLotAccess(session, lotId);

    const body = await request.json().catch(() => null);
    const parsed = echeanceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    let echeance = await prisma.echeance.findFirst({
      where: { lotId, statut: "NON_PAYE" },
      orderBy: { mois: "asc" },
    });

    // Auto-guérison : un lot assigné avant l'ajout de l'échéancier (ou
    // réassigné sans passer par l'API) peut n'avoir aucune échéance. On
    // tente de le générer maintenant plutôt que d'échouer silencieusement.
    if (!echeance) {
      await genererEcheancier(lotId);
      echeance = await prisma.echeance.findFirst({
        where: { lotId, statut: { in: ["NON_PAYE", "EN_COURS"] } },
        orderBy: { mois: "asc" },
      });
    }

    if (!echeance) {
      const lot = await prisma.lot.findUnique({ where: { id: lotId }, select: { montantForfaitaire: true } });
      return NextResponse.json(
        {
          error: lot?.montantForfaitaire
            ? "Aucune échéance en attente pour ce lot."
            : "Ce lot n'a pas de montant forfaitaire défini — impossible de générer un échéancier. Modifiez le lot pour en ajouter un.",
        },
        { status: 404 }
      );
    }

    const updated = await prisma.echeance.update({
      where: { id: echeance.id },
      data: {
        statut: parsed.data.statut,
        montantRecu: parsed.data.montantRecu ?? null,
        datePaiement: parsed.data.datePaiement ? new Date(parsed.data.datePaiement) : null,
        referencePaiement: parsed.data.referencePaiement || null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
