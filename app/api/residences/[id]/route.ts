import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { residenceUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    await assertResidenceAccess(session, id);

    const body = await request.json().catch(() => null);
    const parsed = residenceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const residence = await prisma.residence.update({ where: { id }, data: parsed.data });
    return NextResponse.json(residence);
  } catch (error) {
    return handleApiError(error);
  }
}
