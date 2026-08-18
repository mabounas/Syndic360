import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { AdminsSection } from "../AdminsSection";

export default async function ResidenceAdministrateursPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const canManage = ["SUPER_ADMIN", "SYNDIC_ADMIN"].includes(session.role);

  const residence = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    select: { id: true, admins: { include: { user: true } } },
  });
  if (!residence) return null;

  const candidates = canManage
    ? await prisma.user.findMany({
        where: {
          organisationId: session.organisationId,
          role: { in: ["GESTIONNAIRE", "CONSEIL_BENEVOLE"] },
        },
        select: { id: true, nom: true, prenom: true, email: true, role: true },
      })
    : [];

  return (
    <AdminsSection
      residenceId={residence.id}
      admins={residence.admins.map((a) => a.user)}
      candidates={candidates}
      canManage={canManage}
    />
  );
}
