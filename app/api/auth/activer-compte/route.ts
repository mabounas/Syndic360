import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { activerCompteSchema } from "@/lib/validation";
import { SESSION_COOKIE, SESSION_COOKIE_MAX_AGE, signSession } from "@/lib/session";

const NO_MATCH_ERROR =
  "Aucun lot ne correspond à ces informations. Vérifiez votre saisie ou contactez votre syndic.";

// Auto-activation d'un compte copropriétaire pré-enregistré par son syndic
// (assignation manuelle sans mot de passe, ou import Excel). Vérifie la
// correspondance nom + prénom + email avant d'autoriser l'activation.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = activerCompteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const { email, nom, prenom, telephone, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  const norm = (s: string) => s.trim().toLowerCase();
  const matches =
    user &&
    user.role === "COPROPRIETAIRE" &&
    norm(user.nom) === norm(nom) &&
    norm(user.prenom) === norm(prenom);

  if (!matches) {
    return NextResponse.json({ error: NO_MATCH_ERROR }, { status: 404 });
  }

  if (user!.passwordSet) {
    return NextResponse.json(
      { error: "Ce compte est déjà activé. Connectez-vous directement." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const updated = await prisma.user.update({
    where: { id: user!.id },
    data: { passwordHash, passwordSet: true, ...(telephone ? { telephone } : {}) },
  });

  const lots = await prisma.lotProprietaire.findMany({
    where: { userId: updated.id },
    select: { lot: { select: { numero: true, batiment: { select: { residence: { select: { nom: true } } } } } } },
  });
  const residences = [...new Set(lots.map((l) => l.lot.batiment.residence.nom))];

  const token = await signSession({
    sub: updated.id,
    email: updated.email,
    nom: updated.nom,
    prenom: updated.prenom,
    role: updated.role,
    organisationId: updated.organisationId,
  });

  const response = NextResponse.json({ id: updated.id, email: updated.email, residences });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return response;
}
