import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/app/generated/prisma/enums";

export const SESSION_COOKIE = "syndic360_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours

export type SessionPayload = {
  sub: string; // userId
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  organisationId: string;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET manquant dans l'environnement");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
