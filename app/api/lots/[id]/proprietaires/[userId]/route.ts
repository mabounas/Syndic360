import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertLotAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { updateOccupantSchema } from "@/lib/validation";

// Modifie les informations (nom, prénom, email, téléphone, statut) d'un
// occupant déjà rattaché à un lot — utilisé depuis la fenêtre de modification
// du lot, en plus du formulaire d'assignation initial.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: lotId, userId } = await params;
    await assertLotAccess(session, lotId);

    const link = await prisma.lotProprietaire.findUnique({
      where: { lotId_userId: { lotId, userId } },
    });
    if (!link) notFound("Cet occupant n'est pas rattaché à ce lot.");

    const body = await request.json().catch(() => null);
    const parsed = updateOccupantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing && existing.id !== userId) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          nom: parsed.data.nom,
          prenom: parsed.data.prenom,
          email: parsed.data.email,
          telephone: parsed.data.telephone || null,
        },
      }),
      prisma.lotProprietaire.update({
        where: { lotId_userId: { lotId, userId } },
        data: { typeOccupant: parsed.data.typeOccupant },
      }),
    ]);

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    return handleApiError(error);
  }
}
