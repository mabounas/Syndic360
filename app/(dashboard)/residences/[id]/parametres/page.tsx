import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { ParametresSection } from "../ParametresSection";

export default async function ResidenceParametresPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const residence = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    select: { id: true, nom: true, adresse: true, ville: true, totalTantiemes: true },
  });
  if (!residence) return null;

  return <ParametresSection residence={residence} />;
}
