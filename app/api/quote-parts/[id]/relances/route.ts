import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";

// Enregistre une relance manuelle. L'envoi réel d'email/SMS nécessite une clé
// Resend/Twilio (section 7.2 du CDC) non encore configurée — cette route trace
// seulement l'action pour l'historique et l'affichage du compteur de relances.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: quotePartId } = await params;
    const quotePart = await prisma.quotePart.findUnique({
      where: { id: quotePartId },
      select: {
        appelCharges: { select: { budget: { select: { residenceId: true } } } },
      },
    });
    if (!quotePart) notFound("Quote-part introuvable.");
    await assertResidenceAccess(session, quotePart!.appelCharges.budget.residenceId);

    const relance = await prisma.relance.create({
      data: { quotePartId, type: "MANUELLE", envoyeeParId: session.sub },
    });
    return NextResponse.json(relance, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
