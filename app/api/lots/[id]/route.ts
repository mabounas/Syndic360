import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertLotAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { lotUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    await assertLotAccess(session, id);

    const body = await request.json().catch(() => null);
    const parsed = lotUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const lot = await prisma.lot.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(lot);
  } catch (error) {
    return handleApiError(error);
  }
}
