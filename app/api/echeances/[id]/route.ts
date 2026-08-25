import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertLotAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { echeanceUpdateSchema } from "@/lib/validation";

// Enregistre un paiement (ou son annulation) pour une échéance mensuelle
// d'un lot : montant reçu, date, référence, et statut final (Payé/Non payé).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    const echeance = await prisma.echeance.findUnique({ where: { id }, select: { lotId: true } });
    if (!echeance) notFound("Échéance introuvable.");
    await assertLotAccess(session, echeance!.lotId);

    const body = await request.json().catch(() => null);
    const parsed = echeanceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const updated = await prisma.echeance.update({
      where: { id },
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
