import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { resolutionSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: agId } = await params;
    const ag = await prisma.ag.findUnique({
      where: { id: agId },
      select: { residenceId: true, _count: { select: { resolutions: true } } },
    });
    if (!ag) notFound("Assemblée introuvable.");
    await assertResidenceAccess(session, ag!.residenceId);

    const body = await request.json().catch(() => null);
    const parsed = resolutionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const resolution = await prisma.resolution.create({
      data: { ...parsed.data, agId, ordre: ag!._count.resolutions },
    });
    return NextResponse.json(resolution, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
