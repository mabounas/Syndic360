import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError, notFound } from "@/lib/rbac";
import { sendAccountApprovedEmail, sendAccountRejectedEmail } from "@/lib/email";

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
      select: { id: true, email: true, prenom: true, role: true },
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
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
