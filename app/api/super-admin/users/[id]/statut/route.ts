import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError, notFound } from "@/lib/rbac";
import { sendAccountApprovedEmail, sendAccountRejectedEmail, sendResidentBlockedEmail } from "@/lib/email";

const bodySchema = z.object({ statut: z.enum(["APPROUVE", "REJETE", "BLOQUE"]) });

// Réservé au SuperAdmin : approuve/rejette/bloque un compte SYNDIC_ADMIN
// (administrateur d'organisation) au niveau de la plateforme.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, prenom: true, role: true, organisationId: true },
    });
    if (!target) notFound("Compte introuvable.");
    if (target!.role !== "SYNDIC_ADMIN") {
      return NextResponse.json(
        { error: "Seuls les comptes administrateur d'organisation sont gérés ici." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { statut: parsed.data.statut },
    });

    if (parsed.data.statut === "APPROUVE") {
      await sendAccountApprovedEmail(target!.email, target!.prenom);
    } else if (parsed.data.statut === "REJETE") {
      await sendAccountRejectedEmail(target!.email, target!.prenom);
    } else if (parsed.data.statut === "BLOQUE") {
      // Désactiver un administrateur de syndic désactive aussi tous les
      // copropriétaires des résidences de son organisation, sous sa responsabilité.
      const residents = await prisma.user.findMany({
        where: {
          role: "COPROPRIETAIRE",
          statut: { not: "BLOQUE" },
          lots: { some: { lot: { batiment: { residence: { organisationId: target!.organisationId } } } } },
        },
        select: {
          id: true,
          email: true,
          prenom: true,
          lots: { select: { lot: { select: { batiment: { select: { residence: { select: { nom: true } } } } } } } },
        },
      });

      if (residents.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: residents.map((r) => r.id) } },
          data: { statut: "BLOQUE" },
        });
        await Promise.allSettled(
          residents.map((r) =>
            sendResidentBlockedEmail(r.email, r.prenom, r.lots[0]?.lot.batiment.residence.nom ?? "")
          )
        );
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// Supprime un compte administrateur d'organisation qui n'est pas (ou plus)
// approuvé — évite de supprimer un admin actif sans d'abord le désactiver.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, statut: true },
    });
    if (!target) notFound("Compte introuvable.");
    if (target!.role !== "SYNDIC_ADMIN") {
      return NextResponse.json(
        { error: "Seuls les comptes administrateur d'organisation sont gérés ici." },
        { status: 400 }
      );
    }
    if (target!.statut === "APPROUVE") {
      return NextResponse.json(
        { error: "Désactivez d'abord ce compte avant de le supprimer." },
        { status: 400 }
      );
    }

    try {
      await prisma.user.delete({ where: { id } });
    } catch (deleteError) {
      if (deleteError instanceof Prisma.PrismaClientKnownRequestError && deleteError.code === "P2003") {
        return NextResponse.json(
          { error: "Impossible de supprimer ce compte : des données (votes, historique) y sont encore liées." },
          { status: 409 }
        );
      }
      throw deleteError;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
