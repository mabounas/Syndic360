import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { ResidentsSection, type ResidentRow } from "../ResidentsSection";

export default async function ResidenceResidentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const residence = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    select: {
      id: true,
      batiments: {
        select: {
          lots: {
            select: {
              numero: true,
              proprietaires: { select: { user: true } },
            },
          },
        },
      },
    },
  });
  if (!residence) return null;

  const byUser = new Map<string, ResidentRow>();
  for (const batiment of residence.batiments) {
    for (const lot of batiment.lots) {
      for (const p of lot.proprietaires) {
        const existing = byUser.get(p.user.id);
        if (existing) {
          existing.lots.push(lot.numero);
        } else {
          byUser.set(p.user.id, {
            id: p.user.id,
            nom: p.user.nom,
            prenom: p.user.prenom,
            email: p.user.email,
            statut: p.user.statut,
            passwordSet: p.user.passwordSet,
            lots: [lot.numero],
          });
        }
      }
    }
  }

  return (
    <ResidentsSection residenceId={residence.id} residents={[...byUser.values()]} />
  );
}
