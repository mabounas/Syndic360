import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { handleApiError, requireOrgAdminRole } from "@/lib/rbac";
import { residenceSchema } from "@/lib/validation";
import { residenceLimitForPlan } from "@/lib/plans";

// Seuls SYNDIC_ADMIN/SUPER_ADMIN créent des résidences (portefeuille de l'organisation) ;
// un GESTIONNAIRE/CONSEIL_BENEVOLE ne gère que les résidences qui lui sont assignées.
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireOrgAdminRole(session);

    const body = await request.json().catch(() => null);
    const parsed = residenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    if (session.role !== "SUPER_ADMIN") {
      const organisation = await prisma.organisation.findUnique({
        where: { id: session.organisationId },
        select: { plan: true, _count: { select: { residences: true } } },
      });
      const limit = residenceLimitForPlan(organisation?.plan ?? "BENEVOLE");
      if ((organisation?._count.residences ?? 0) >= limit) {
        return NextResponse.json(
          {
            error: `Limite de résidences atteinte pour votre plan (${limit} maximum). Passez à un plan supérieur pour en ajouter.`,
          },
          { status: 422 }
        );
      }
    }

    const residence = await prisma.residence.create({
      data: {
        ...parsed.data,
        organisationId: session.organisationId,
        admins: { create: { userId: session.sub } },
      },
    });
    return NextResponse.json(residence, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
