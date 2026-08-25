import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, ownedLotIds } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { ChargesTable } from "@/components/ui/ChargesTable";
import { KpiCard } from "@/components/ui/KpiCard";
import type { Echeance } from "@/app/generated/prisma/client";

const ECHEANCE_STATUT_TO_CHARGE_STATUT = {
  EN_COURS: "EN_ATTENTE",
  NON_PAYE: "EN_RETARD",
  PAYE: "PAYE",
} as const;

function computeStats(echeances: Echeance[]) {
  const anneeCourante = new Date().getFullYear();
  let impayesExerciceCourant = 0;
  let impayesExercicesPrecedents = 0;
  let payeExerciceCourant = 0;
  let dernierPaiement: { date: Date; montant: number } | null = null;

  for (const e of echeances) {
    const annee = e.mois.getFullYear();
    if (e.statut === "NON_PAYE") {
      if (annee === anneeCourante) impayesExerciceCourant += e.montant;
      else if (annee < anneeCourante) impayesExercicesPrecedents += e.montant;
    }
    if (e.statut === "PAYE") {
      const montant = e.montantRecu ?? e.montant;
      if (annee === anneeCourante) payeExerciceCourant += montant;
      const datePaiement = e.datePaiement ?? e.mois;
      if (!dernierPaiement || datePaiement.getTime() > dernierPaiement.date.getTime()) {
        dernierPaiement = { date: datePaiement, montant };
      }
    }
  }

  return { impayesExerciceCourant, impayesExercicesPrecedents, payeExerciceCourant, dernierPaiement };
}

export default async function MesChargesPage() {
  const session = await requireSession();
  if (isStaffRole(session.role)) redirect("/dashboard");

  const lotIds = await ownedLotIds(session);

  const [quoteParts, echeances] = await Promise.all([
    prisma.quotePart.findMany({
      where: { lotId: { in: lotIds } },
      include: { lot: true, appelCharges: true },
      orderBy: { appelCharges: { dateEcheance: "desc" } },
    }),
    prisma.echeance.findMany({
      where: { lotId: { in: lotIds } },
      include: { lot: true },
      orderBy: { mois: "desc" },
    }),
  ]);

  const quotePartRows = quoteParts.map((qp) => ({
    id: qp.id,
    lotNumero: qp.lot.numero,
    periode: qp.appelCharges.periode,
    montant: qp.montant,
    statut: qp.statut,
    datePaiement: qp.datePaiement ? qp.datePaiement.toISOString() : null,
    sortDate: qp.appelCharges.dateEcheance,
  }));

  const echeanceRows = echeances.map((e) => ({
    id: `ech-${e.id}`,
    lotNumero: e.lot.numero,
    periode: e.mois.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    montant: e.montant,
    statut: ECHEANCE_STATUT_TO_CHARGE_STATUT[e.statut],
    datePaiement: e.datePaiement ? e.datePaiement.toISOString() : null,
    sortDate: e.mois,
  }));

  const rows = [...quotePartRows, ...echeanceRows]
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .map(({ sortDate, ...row }) => row);

  const stats = computeStats(echeances);

  return (
    <div className="space-y-6">
      <Header title="Mes charges" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Impayés exercice en cours"
          value={`${stats.impayesExerciceCourant.toLocaleString("fr-MA")} MAD`}
          color="danger"
        />
        <KpiCard
          label="Impayés exercices précédents"
          value={`${stats.impayesExercicesPrecedents.toLocaleString("fr-MA")} MAD`}
          color="danger"
        />
        <KpiCard
          label="Payé exercice en cours"
          value={`${stats.payeExerciceCourant.toLocaleString("fr-MA")} MAD`}
          color="success"
        />
        <KpiCard
          label="Dernier paiement"
          value={
            stats.dernierPaiement
              ? `${stats.dernierPaiement.montant.toLocaleString("fr-MA")} MAD`
              : "—"
          }
          caption={stats.dernierPaiement ? stats.dernierPaiement.date.toLocaleDateString("fr-MA") : undefined}
        />
      </div>
      <ChargesTable rows={rows} />
    </div>
  );
}
