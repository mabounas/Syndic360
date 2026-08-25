import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, unclaimedPasswordHash } from "@/lib/auth";
import { assertLotAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { assignProprietaireSchema } from "@/lib/validation";
import { genererEcheancier } from "@/lib/echeancier";

// Ajoute un copropriétaire/locataire à un lot. Si un mot de passe est fourni,
// le compte est immédiatement utilisable (approuvé — vetté en personne par le
// syndic). Sinon, le compte est créé sans mot de passe utilisable : le résident
// devra l'activer lui-même via /activer-mon-compte (vérification nom/prénom/email),
// après quoi il reste en attente d'approbation de l'admin de résidence.
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

    const hasPassword = !!parsed.data.password;
    const passwordHash = hasPassword
      ? await hashPassword(parsed.data.password!)
      : await unclaimedPasswordHash();

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        telephone: parsed.data.telephone || undefined,
        passwordHash,
        passwordSet: hasPassword,
        statut: hasPassword ? "APPROUVE" : "EN_ATTENTE",
        role: "COPROPRIETAIRE",
        organisationId: session.organisationId,
      },
    });

    await prisma.lotProprietaire.create({
      data: { lotId, userId: user.id, typeOccupant: parsed.data.typeOccupant },
    });

    await genererEcheancier(lotId);

    return NextResponse.json(
      { id: user.id, email: user.email, passwordSet: hasPassword },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
