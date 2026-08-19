import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/rbac";
import { organisationSettingsSchema } from "@/lib/validation";

// Coordonnées bancaires et contact syndic — propres à l'organisation
// (le syndic), pas à une résidence particulière. Réservé au SYNDIC_ADMIN.
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    if (session.role !== "SYNDIC_ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = organisationSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const organisation = await prisma.organisation.update({
      where: { id: session.organisationId },
      data: parsed.data,
    });
    return NextResponse.json(organisation);
  } catch (error) {
    return handleApiError(error);
  }
}
