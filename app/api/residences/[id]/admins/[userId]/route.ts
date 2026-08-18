import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireOrgAdminRole } from "@/lib/rbac";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireOrgAdminRole(session);

    const { id: residenceId, userId } = await params;
    await assertResidenceAccess(session, residenceId);

    await prisma.residenceAdmin.deleteMany({ where: { residenceId, userId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
