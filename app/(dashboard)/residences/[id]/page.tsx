import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { BatimentsSection } from "./BatimentsSection";
import { ImportSection } from "./ImportSection";

export default async function ResidenceLotsPage({
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
        orderBy: { nom: "asc" },
        include: {
          lots: {
            orderBy: { numero: "asc" },
            include: { proprietaires: { include: { user: true } } },
          },
        },
      },
    },
  });
  if (!residence) return null;

  return (
    <div className="space-y-6">
      <ImportSection residenceId={residence.id} />
      <BatimentsSection residenceId={residence.id} batiments={residence.batiments} />
    </div>
  );
}
