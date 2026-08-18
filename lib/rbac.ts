import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/session";
import type { Role } from "@/app/generated/prisma/enums";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const forbidden = (message = "Accès refusé."): never => {
  throw new HttpError(403, message);
};
export const notFound = (message = "Ressource introuvable."): never => {
  throw new HttpError(404, message);
};

export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
}

const STAFF_ROLES: Role[] = [
  "SUPER_ADMIN",
  "SYNDIC_ADMIN",
  "GESTIONNAIRE",
  "CONSEIL_BENEVOLE",
];

// SUPER_ADMIN et SYNDIC_ADMIN voient toutes les résidences de leur organisation.
// GESTIONNAIRE et CONSEIL_BENEVOLE ne voient que les résidences où ils sont
// explicitement assignés comme administrateur (table ResidenceAdmin).
const ORG_WIDE_ROLES: Role[] = ["SUPER_ADMIN", "SYNDIC_ADMIN"];

export function isStaffRole(role: Role) {
  return STAFF_ROLES.includes(role);
}

/** Exige un rôle "staff" (gestion), rejette copropriétaire/prestataire. */
export function requireStaffRole(session: SessionPayload) {
  if (!isStaffRole(session.role)) forbidden();
}

/** Exige un rôle habilité à gérer les administrateurs d'une résidence (SYNDIC_ADMIN/SUPER_ADMIN). */
export function requireOrgAdminRole(session: SessionPayload) {
  if (!ORG_WIDE_ROLES.includes(session.role)) forbidden();
}

/**
 * Clause `where` Prisma pour limiter une requête Residence à ce que la session peut voir.
 */
export function residenceScopeWhere(session: SessionPayload) {
  if (session.role === "SUPER_ADMIN") return {};
  if (session.role === "SYNDIC_ADMIN") {
    return { organisationId: session.organisationId };
  }
  return {
    organisationId: session.organisationId,
    admins: { some: { userId: session.sub } },
  };
}

/** Vérifie que la session (rôle staff) a le droit d'accéder à cette résidence. */
export async function assertResidenceAccess(
  session: SessionPayload,
  residenceId: string
) {
  const residence = await prisma.residence.findUnique({
    where: { id: residenceId },
    select: { id: true, organisationId: true },
  });
  if (!residence) notFound("Résidence introuvable.");

  if (session.role === "SUPER_ADMIN") return residence!;

  if (residence!.organisationId !== session.organisationId) {
    forbidden("Cette résidence n'appartient pas à votre organisation.");
  }

  if (ORG_WIDE_ROLES.includes(session.role)) return residence!;

  const isAssigned = await prisma.residenceAdmin.findFirst({
    where: { residenceId, userId: session.sub },
    select: { id: true },
  });
  if (!isAssigned) {
    forbidden("Vous n'êtes pas administrateur de cette résidence.");
  }
  return residence!;
}

/**
 * Vérifie l'accès à un lot :
 * - staff : la résidence du lot doit être accessible (assertResidenceAccess)
 * - copropriétaire : le lot doit lui appartenir (table LotProprietaire)
 */
export async function assertLotAccess(session: SessionPayload, lotId: string) {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: { id: true, batiment: { select: { residenceId: true } } },
  });
  if (!lot) notFound("Lot introuvable.");

  if (isStaffRole(session.role)) {
    await assertResidenceAccess(session, lot!.batiment.residenceId);
    return lot!;
  }

  const owns = await prisma.lotProprietaire.findFirst({
    where: { lotId, userId: session.sub },
    select: { id: true },
  });
  if (!owns) forbidden("Ce lot ne vous appartient pas.");
  return lot!;
}

/** Renvoie les ids de lots possédés par le copropriétaire connecté. */
export async function ownedLotIds(session: SessionPayload): Promise<string[]> {
  const rows = await prisma.lotProprietaire.findMany({
    where: { userId: session.sub },
    select: { lotId: true },
  });
  return rows.map((r) => r.lotId);
}
