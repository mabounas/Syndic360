import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { SESSION_COOKIE, SESSION_COOKIE_MAX_AGE, signSession } from "@/lib/session";

// Auto-inscription réservée à un nouveau syndic (professionnel ou bénévole) créant
// son organisation. Les copropriétaires sont ajoutés par leur syndic depuis le
// tableau de bord (jamais d'auto-inscription publique pour ce rôle).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const { organisationNom, plan, nom, prenom, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const { user } = await prisma.$transaction(async (tx) => {
    const organisation = await tx.organisation.create({
      data: { nom: organisationNom, plan },
    });
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        nom,
        prenom,
        role: "SYNDIC_ADMIN",
        organisationId: organisation.id,
      },
    });
    return { organisation, user };
  });

  const token = await signSession({
    sub: user.id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    organisationId: user.organisationId,
  });

  const response = NextResponse.json({ id: user.id, email: user.email });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return response;
}
