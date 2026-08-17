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

export function isStaffRole(role: Role) {
  return STAFF_ROLES.includes(role);
}

/** Exige un rôle "staff" (gestion), rejette copropriétaire/prestataire. */
export function requireStaffRole(session: SessionPayload) {
  if (!isStaffRole(session.role)) forbidden();
}

/**
 * Clause `where` Prisma pour limiter une requête Residence à ce que la session peut voir.
 * SUPER_ADMIN voit tout ; les autres rôles staff sont bornés à leur organisation.
 */
export function residenceScopeWhere(session: SessionPayload) {
  if (session.role === "SUPER_ADMIN") return {};
  return { organisationId: session.organisationId };
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
  if (
    session.role !== "SUPER_ADMIN" &&
    residence!.organisationId !== session.organisationId
  ) {
    forbidden("Cette résidence n'appartient pas à votre organisation.");
  }
  return residence!;
}

/**
 * Vérifie l'accès à un lot :
 * - staff : le lot doit appartenir à une résidence de son organisation (ou SUPER_ADMIN = tout)
 * - copropriétaire : le lot doit lui appartenir (table LotProprietaire)
 */
export async function assertLotAccess(session: SessionPayload, lotId: string) {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: {
      id: true,
      batiment: { select: { residenceId: true, residence: { select: { organisationId: true } } } },
    },
  });
  if (!lot) notFound("Lot introuvable.");

  if (isStaffRole(session.role)) {
    if (
      session.role !== "SUPER_ADMIN" &&
      lot!.batiment.residence.organisationId !== session.organisationId
    ) {
      forbidden("Ce lot n'appartient pas à votre organisation.");
    }
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
