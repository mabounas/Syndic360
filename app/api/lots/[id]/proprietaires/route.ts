import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { assertLotAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { assignProprietaireSchema } from "@/lib/validation";

// Ajoute un copropriétaire à un lot. Crée le compte utilisateur (pas d'auto-inscription
// publique pour ce rôle — c'est le syndic qui provisionne l'accès de ses copropriétaires).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: lotId } = await params;
    await assertLotAccess(session, lotId);

    const body = await request.json().catch(() => null);
    const parsed = assignProprietaireSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        passwordHash,
        role: "COPROPRIETAIRE",
        organisationId: session.organisationId,
      },
    });

    await prisma.lotProprietaire.create({ data: { lotId, userId: user.id } });

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
