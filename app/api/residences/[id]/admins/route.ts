import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireOrgAdminRole } from "@/lib/rbac";
import { z } from "zod";

const assignAdminSchema = z.object({ userId: z.string().min(1) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireOrgAdminRole(session);

    const { id: residenceId } = await params;
    await assertResidenceAccess(session, residenceId);

    const body = await request.json().catch(() => null);
    const parsed = assignAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Utilisateur invalide." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, organisationId: true, role: true },
    });
    if (
      !user ||
      user.organisationId !== session.organisationId ||
      !["GESTIONNAIRE", "CONSEIL_BENEVOLE"].includes(user.role)
    ) {
      return NextResponse.json(
        { error: "Cet utilisateur ne peut pas être administrateur de résidence." },
        { status: 400 }
      );
    }

    const admin = await prisma.residenceAdmin.upsert({
      where: { residenceId_userId: { residenceId, userId: user.id } },
      create: { residenceId, userId: user.id },
      update: {},
    });
    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
