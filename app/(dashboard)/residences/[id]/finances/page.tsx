import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { FinanceSection } from "../FinanceSection";

export default async function ResidenceFinancesPage({
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
      budgets: {
        orderBy: { annee: "desc" },
        include: {
          appelsCharges: {
            orderBy: { dateEcheance: "desc" },
            include: { quoteParts: { include: { lot: true, relances: true } } },
          },
        },
      },
    },
  });
  if (!residence) return null;

  return <FinanceSection residenceId={residence.id} budgets={residence.budgets} />;
}
