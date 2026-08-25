import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertLotAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { echeanceUpdateSchema } from "@/lib/validation";

// Enregistre un paiement pour un lot en ciblant l'échéance du mois de la
// date saisie (pas forcément le mois courant — permet de saisir un paiement
// rétroactif, ex : un règlement de 2024). Comportement "Paiement reçu" —
// le syndic choisit le copropriétaire et la date, pas une ligne précise de
// l'échéancier.
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

    const paymentDate = parsed.data.datePaiement ? new Date(parsed.data.datePaiement) : new Date();
    const targetMois = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);

    let echeance = await prisma.echeance.findUnique({
      where: { lotId_mois: { lotId, mois: targetMois } },
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

      const echeancierDejaDemarre = await prisma.echeance.findFirst({ where: { lotId } });
      if (!echeancierDejaDemarre) {
        // Tout premier paiement de ce lot : l'échéancier n'existe pas encore
        // du tout. Le client doit confirmer avant de le démarrer (mois de la
        // date saisie -> décembre de cette année-là) via
        // POST /api/lots/[id]/echeancier.
        return NextResponse.json(
          { error: "Aucun échéancier pour ce lot.", needsEcheancier: true },
          { status: 409 }
        );
      }

      // L'échéancier existe déjà pour ce lot mais pas pour ce mois précis
      // (ex : mois historique manquant) — on le crée directement, sans
      // confirmation puisqu'il s'agit d'un seul mois explicitement choisi.
      echeance = await prisma.echeance.create({
        data: { lotId, mois: targetMois, montant: lot.montantForfaitaire, statut: "EN_COURS" },
      });
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
