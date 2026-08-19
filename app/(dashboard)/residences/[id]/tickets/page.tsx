import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { TicketsSection } from "../TicketsSection";

export default async function ResidenceTicketsPage({
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
      tickets: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          titre: true,
          description: true,
          localisation: true,
          urgence: true,
          statut: true,
          signalePar: true,
          createdAt: true,
        },
      },
    },
  });
  if (!residence) return null;

  return <TicketsSection residenceId={residence.id} tickets={residence.tickets} />;
}
