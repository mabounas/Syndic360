import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError, requireStaffRole } from "@/lib/rbac";
import { residenceSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const body = await request.json().catch(() => null);
    const parsed = residenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const residence = await prisma.residence.create({
      data: { ...parsed.data, organisationId: session.organisationId },
    });
    return NextResponse.json(residence, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
