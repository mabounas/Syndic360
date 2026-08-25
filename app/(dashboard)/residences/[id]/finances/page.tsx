import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { actualiserEcheancesEchues } from "@/lib/echeancier";
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

  const residenceScope = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    select: { id: true },
  });
  if (!residenceScope) return null;

  await actualiserEcheancesEchues(residenceScope.id);

  const residence = await prisma.residence.findFirst({
    where: { id: residenceScope.id },
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
              soldeDepart: true,
              proprietaires: { select: { user: { select: { nom: true, prenom: true, email: true } } } },
              echeances: {
                select: {
                  mois: true,
                  montant: true,
                  statut: true,
                  montantRecu: true,
                  datePaiement: true,
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
      const impayes = lot.echeances
        .filter((e) => e.statut === "NON_PAYE")
        .reduce((sum, e) => sum + e.montant, 0);
      const soldeComptable = lot.soldeDepart + impayes;

      return {
        lotId: lot.id,
        lotNumero: lot.numero,
        occupants: lot.proprietaires.map((p) => p.user),
        soldeDepart: lot.soldeDepart,
        soldeComptable,
        situation: soldeComptable > 0 ? "EN_RETARD" : "A_JOUR",
        historique: [...lot.echeances].sort((a, b) => b.mois.getTime() - a.mois.getTime()),
      };
    });

  return (
    <div className="space-y-6">
      <CoproprietaireFinanceSection rows={coproprietaireRows} />
      <FinanceSection residenceId={residence.id} budgets={residence.budgets} />
    </div>
  );
}
