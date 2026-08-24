import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { FinanceSection } from "../FinanceSection";
import { CoproprietaireFinanceSection } from "../CoproprietaireFinanceSection";
import type { CoproprietaireFinanceRow } from "../types";

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
      batiments: {
        select: {
          lots: {
            orderBy: { numero: "asc" },
            select: {
              id: true,
              numero: true,
              proprietaires: { select: { user: { select: { nom: true, prenom: true, email: true } } } },
              quoteParts: {
                select: {
                  montant: true,
                  statut: true,
                  datePaiement: true,
                  appelCharges: { select: { periode: true, budget: { select: { annee: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!residence) return null;

  const coproprietaireRows: CoproprietaireFinanceRow[] = residence.batiments
    .flatMap((b) => b.lots)
    .map((lot) => {
      const soldeComptable = lot.quoteParts
        .filter((qp) => qp.statut !== "PAYE")
        .reduce((sum, qp) => sum + qp.montant, 0);
      const situation: CoproprietaireFinanceRow["situation"] =
        soldeComptable === 0
          ? "A_JOUR"
          : lot.quoteParts.some((qp) => qp.statut === "EN_RETARD")
            ? "EN_RETARD"
            : "EN_ATTENTE";

      return {
        lotId: lot.id,
        lotNumero: lot.numero,
        occupants: lot.proprietaires.map((p) => p.user),
        soldeComptable,
        situation,
        historique: lot.quoteParts
          .map((qp) => ({
            annee: qp.appelCharges.budget.annee,
            periode: qp.appelCharges.periode,
            montant: qp.montant,
            statut: qp.statut,
            datePaiement: qp.datePaiement,
          }))
          .sort((a, b) => b.annee - a.annee),
      };
    });

  return (
    <div className="space-y-6">
      <CoproprietaireFinanceSection rows={coproprietaireRows} />
      <FinanceSection residenceId={residence.id} budgets={residence.budgets} />
    </div>
  );
}
