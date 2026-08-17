import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";
import { quotePartUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    const quotePart = await prisma.quotePart.findUnique({
      where: { id },
      select: {
        appelCharges: { select: { budget: { select: { residenceId: true } } } },
      },
    });
    if (!quotePart) notFound("Quote-part introuvable.");
    await assertResidenceAccess(session, quotePart!.appelCharges.budget.residenceId);

    const body = await request.json().catch(() => null);
    const parsed = quotePartUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const updated = await prisma.quotePart.update({
      where: { id },
      data: {
        statut: parsed.data.statut,
        datePaiement: parsed.data.statut === "PAYE" ? new Date() : null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
