import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { ecritureSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const body = await request.json().catch(() => null);
    const parsed = ecritureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    await assertResidenceAccess(session, parsed.data.residenceId);

    const ecriture = await prisma.ecritureComptable.create({
      data: { ...parsed.data, date: new Date(parsed.data.date) },
    });
    return NextResponse.json(ecriture, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
