import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { ComptabiliteSection } from "../ComptabiliteSection";

export default async function ResidenceComptabilitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const residence = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    select: { id: true, ecritures: { orderBy: { date: "desc" } } },
  });
  if (!residence) return null;

  return <ComptabiliteSection residenceId={residence.id} ecritures={residence.ecritures} />;
}
