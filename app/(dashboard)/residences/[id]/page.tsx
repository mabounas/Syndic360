import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { BatimentsSection } from "./BatimentsSection";
import { FinanceSection } from "./FinanceSection";
import { DocumentsSection } from "./DocumentsSection";

export default async function ResidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (!isStaffRole(session.role)) redirect("/mes-charges");

  const { id } = await params;

  const residence = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    include: {
      batiments: {
        orderBy: { nom: "asc" },
        include: {
          lots: {
            orderBy: { numero: "asc" },
            include: { proprietaires: { include: { user: true } } },
          },
        },
      },
      budgets: {
        orderBy: { annee: "desc" },
        include: {
          appelsCharges: {
            orderBy: { dateEcheance: "desc" },
            include: { quoteParts: { include: { lot: true } } },
          },
        },
      },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!residence) notFound();

  const allLots = residence.batiments.flatMap((b) => b.lots);

  return (
    <div className="space-y-6">
      <Header title={residence.nom} />
      <p className="-mt-4 text-sm text-text-secondary">
        {residence.adresse}, {residence.ville}
      </p>

      <BatimentsSection residenceId={residence.id} batiments={residence.batiments} />
      <FinanceSection residenceId={residence.id} budgets={residence.budgets} />
      <DocumentsSection
        residenceId={residence.id}
        documents={residence.documents}
        lots={allLots}
      />
    </div>
  );
}
