import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError, notFound } from "@/lib/rbac";

const bodySchema = z.object({ statut: z.enum(["NOUVEAU", "TRAITE"]) });

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
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) notFound("Message introuvable.");

    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { statut: parsed.data.statut },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
