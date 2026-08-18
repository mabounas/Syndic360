import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";

const actionSchema = z.object({ action: z.enum(["convoquer", "cloturer"]) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    const ag = await prisma.ag.findUnique({ where: { id }, select: { residenceId: true } });
    if (!ag) notFound("Assemblée introuvable.");
    await assertResidenceAccess(session, ag!.residenceId);

    const body = await request.json().catch(() => null);
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    }

    const updated = await prisma.ag.update({
      where: { id },
      data:
        parsed.data.action === "convoquer"
          ? { statut: "CONVOQUEE", convocationEnvoyee: true }
          : { statut: "CLOTUREE" },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
