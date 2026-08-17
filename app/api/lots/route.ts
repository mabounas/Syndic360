import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { lotSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const body = await request.json().catch(() => null);
    const parsed = lotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const batiment = await prisma.batiment.findUnique({
      where: { id: parsed.data.batimentId },
      select: { residenceId: true },
    });
    if (!batiment) notFound("Bâtiment introuvable.");
    await assertResidenceAccess(session, batiment!.residenceId);

    const lot = await prisma.lot.create({ data: parsed.data });
    return NextResponse.json(lot, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
