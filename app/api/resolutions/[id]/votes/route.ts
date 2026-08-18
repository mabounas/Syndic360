import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, forbidden, handleApiError, isStaffRole, notFound } from "@/lib/rbac";
import { voteSchema } from "@/lib/validation";

// Vote enregistré par lot (le poids est celui du lot en tantièmes, indépendamment
// du nombre de co-indivisaires — section 6.5 du CDC). Un gestionnaire/syndic peut
// enregistrer un vote pour n'importe quel lot de sa résidence (vote en séance) ;
// un copropriétaire ne peut voter que pour ses propres lots, et uniquement pendant
// la fenêtre de vote (AG au statut CONVOQUEE).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const { id: resolutionId } = await params;
    const resolution = await prisma.resolution.findUnique({
      where: { id: resolutionId },
      select: { ag: { select: { id: true, statut: true, residenceId: true } } },
    });
    if (!resolution) notFound("Résolution introuvable.");

    const body = await request.json().catch(() => null);
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Vote invalide." }, { status: 400 });
    }

    if (isStaffRole(session.role)) {
      await assertResidenceAccess(session, resolution!.ag.residenceId);
    } else {
      if (resolution!.ag.statut !== "CONVOQUEE") {
        forbidden("Le vote n'est pas encore ouvert pour cette assemblée.");
      }
      const owns = await prisma.lotProprietaire.findFirst({
        where: { lotId: parsed.data.lotId, userId: session.sub },
        select: { id: true },
      });
      if (!owns) forbidden("Ce lot ne vous appartient pas.");
    }

    const vote = await prisma.vote.upsert({
      where: { resolutionId_lotId: { resolutionId, lotId: parsed.data.lotId } },
      create: { resolutionId, lotId: parsed.data.lotId, userId: session.sub, valeur: parsed.data.valeur },
      update: { valeur: parsed.data.valeur, userId: session.sub },
    });
    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
