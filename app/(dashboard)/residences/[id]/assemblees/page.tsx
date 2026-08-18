import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { AgSection } from "../AgSection";

export default async function ResidenceAssembleesPage({
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
      assemblees: {
        orderBy: { date: "desc" },
        include: { resolutions: { orderBy: { ordre: "asc" }, include: { votes: true } } },
      },
      batiments: {
        select: { lots: { select: { id: true, numero: true, tantiemesGeneraux: true } } },
      },
    },
  });
  if (!residence) return null;

  const lots = residence.batiments.flatMap((b) => b.lots);

  return <AgSection residenceId={residence.id} assemblees={residence.assemblees} lots={lots} />;
}
