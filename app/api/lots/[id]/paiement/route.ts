import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertLotAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { echeanceUpdateSchema } from "@/lib/validation";

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

    const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const echeance = await prisma.echeance.findFirst({
      where: {
        lotId,
        OR: [{ statut: "NON_PAYE" }, { statut: "EN_COURS", mois: { lte: startOfCurrentMonth } }],
      },
      orderBy: { mois: "asc" },
    });

    if (!echeance) {
      const lot = await prisma.lot.findUnique({ where: { id: lotId }, select: { montantForfaitaire: true } });
      if (!lot?.montantForfaitaire) {
        return NextResponse.json(
          {
            error:
              "Ce lot n'a pas de montant forfaitaire défini — impossible de démarrer un échéancier. Modifiez le lot pour en ajouter un.",
          },
          { status: 404 }
        );
      }
      // Aucune échéance encore générée pour ce lot (premier paiement, ou
      // nouvelle année) — le client doit demander confirmation avant de
      // démarrer l'échéancier via POST /api/lots/[id]/echeancier.
      return NextResponse.json(
        { error: "Aucun échéancier pour ce lot.", needsEcheancier: true },
        { status: 409 }
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
