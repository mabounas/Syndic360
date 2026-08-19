import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { ticketStatutSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({ where: { id }, select: { residenceId: true } });
    if (!ticket) notFound("Ticket introuvable.");
    await assertResidenceAccess(session, ticket!.residenceId);

    const body = await request.json().catch(() => null);
    const parsed = ticketStatutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const updated = await prisma.ticket.update({ where: { id }, data: { statut: parsed.data.statut } });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
