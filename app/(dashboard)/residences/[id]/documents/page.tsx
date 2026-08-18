import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { DocumentsSection } from "../DocumentsSection";

export default async function ResidenceDocumentsPage({
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
      documents: { orderBy: { createdAt: "desc" } },
      batiments: { select: { lots: { select: { id: true, numero: true } } } },
    },
  });
  if (!residence) return null;

  const lots = residence.batiments.flatMap((b) => b.lots);

  return (
    <DocumentsSection residenceId={residence.id} documents={residence.documents} lots={lots} />
  );
}
