import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { sendResidentApprovedEmail, sendResidentBlockedEmail } from "@/lib/email";

const bodySchema = z.object({ statut: z.enum(["APPROUVE", "REJETE", "BLOQUE"]) });

// Permet à un admin de résidence d'approuver, rejeter ou bloquer un
// copropriétaire lié à un lot de sa résidence.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: residenceId, userId } = await params;
    const residence = await assertResidenceAccess(session, residenceId);

    const target = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "COPROPRIETAIRE",
        lots: { some: { lot: { batiment: { residenceId } } } },
      },
      select: { id: true, email: true, prenom: true },
    });
    if (!target) notFound("Ce résident n'est pas rattaché à cette résidence.");

    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { statut: parsed.data.statut },
    });

    const residenceRow = await prisma.residence.findUnique({
      where: { id: residence.id },
      select: { nom: true },
    });

    if (parsed.data.statut === "APPROUVE") {
      await sendResidentApprovedEmail(target!.email, target!.prenom, residenceRow?.nom ?? "");
    } else if (parsed.data.statut === "BLOQUE") {
      await sendResidentBlockedEmail(target!.email, target!.prenom, residenceRow?.nom ?? "");
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
