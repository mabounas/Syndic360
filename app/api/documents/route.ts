import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { documentSchema } from "@/lib/validation";

// Enregistre un document déjà téléversé sur Vercel Blob (voir /api/documents/upload-url).
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const body = await request.json().catch(() => null);
    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    await assertResidenceAccess(session, parsed.data.residenceId);

    const document = await prisma.document.create({
      data: { ...parsed.data, uploaderId: session.sub },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
