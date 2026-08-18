import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { BatimentsSection } from "./BatimentsSection";
import { FinanceSection } from "./FinanceSection";
import { DocumentsSection } from "./DocumentsSection";
import { AdminsSection } from "./AdminsSection";
import { ImportSection } from "./ImportSection";
import { AgSection } from "./AgSection";
import { ComptabiliteSection } from "./ComptabiliteSection";

export default async function ResidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (!isStaffRole(session.role)) redirect("/mes-charges");

  const { id } = await params;
  const canManageAdmins = ["SUPER_ADMIN", "SYNDIC_ADMIN"].includes(session.role);

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
            include: { quoteParts: { include: { lot: true, relances: true } } },
          },
        },
      },
      documents: { orderBy: { createdAt: "desc" } },
      admins: { include: { user: true } },
      assemblees: {
        orderBy: { date: "desc" },
        include: { resolutions: { orderBy: { ordre: "asc" }, include: { votes: true } } },
      },
      ecritures: { orderBy: { date: "desc" } },
    },
  });

  if (!residence) notFound();

  const allLots = residence.batiments.flatMap((b) => b.lots);

  const candidates = canManageAdmins
    ? await prisma.user.findMany({
        where: {
          organisationId: session.organisationId,
          role: { in: ["GESTIONNAIRE", "CONSEIL_BENEVOLE"] },
        },
        select: { id: true, nom: true, prenom: true, email: true, role: true },
      })
    : [];

  return (
    <div className="space-y-6">
      <Header title={residence.nom} />
      <p className="-mt-4 text-sm text-text-secondary">
        {residence.adresse}, {residence.ville}
      </p>

      <AdminsSection
        residenceId={residence.id}
        admins={residence.admins.map((a) => a.user)}
        candidates={candidates}
        canManage={canManageAdmins}
      />
      <ImportSection residenceId={residence.id} />
      <BatimentsSection residenceId={residence.id} batiments={residence.batiments} />
      <FinanceSection residenceId={residence.id} budgets={residence.budgets} />
      <AgSection residenceId={residence.id} assemblees={residence.assemblees} lots={allLots} />
      <ComptabiliteSection residenceId={residence.id} ecritures={residence.ecritures} />
      <DocumentsSection
        residenceId={residence.id}
        documents={residence.documents}
        lots={allLots}
      />
    </div>
  );
}
