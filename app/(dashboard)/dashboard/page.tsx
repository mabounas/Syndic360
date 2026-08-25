import { redirect } from "next/navigation";
import { Building2, DoorOpen, AlertTriangle, Wallet, TrendingUp, History } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/ui/KpiCard";
import { ResidenceCard } from "@/components/ui/ResidenceCard";
import { actualiserEcheancesEchues } from "@/lib/echeancier";

export default async function DashboardPage() {
  const session = await requireSession();

  if (!isStaffRole(session.role)) {
    redirect("/mes-charges");
  }

  const where = residenceScopeWhere(session);
  const lotFilter = { batiment: { residence: where } };

  const now = new Date();
  const anneeActuelle = now.getFullYear();
  const startOfMonth = new Date(anneeActuelle, now.getMonth(), 1);
  const startOfYear = new Date(anneeActuelle, 0, 1);

  await actualiserEcheancesEchues(where);

  const residences = await prisma.residence.findMany({
    where,
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, ville: true, nbLots: true },
  });

  const [
    lotsCount,
    impayesCount,
    ecrituresRecettes,
    ecrituresDepenses,
    echeancesPayeesTotal,
    payeMois,
    payeAnnee,
    echeancesImpayees,
  ] = await Promise.all([
    prisma.lot.count({ where: lotFilter }),
    prisma.echeance.count({ where: { statut: "NON_PAYE", lot: lotFilter } }),
    prisma.ecritureComptable.aggregate({
      where: { type: "RECETTE", residence: where },
      _sum: { montant: true },
    }),
    prisma.ecritureComptable.aggregate({
      where: { type: "DEPENSE", residence: where },
      _sum: { montant: true },
    }),
    prisma.echeance.aggregate({
      where: { statut: "PAYE", lot: lotFilter },
      _sum: { montantRecu: true },
    }),
    prisma.echeance.aggregate({
      where: { statut: "PAYE", datePaiement: { gte: startOfMonth }, lot: lotFilter },
      _sum: { montantRecu: true },
    }),
    prisma.echeance.aggregate({
      where: { statut: "PAYE", datePaiement: { gte: startOfYear }, lot: lotFilter },
      _sum: { montantRecu: true },
    }),
    prisma.echeance.findMany({
      where: { statut: "NON_PAYE", lot: lotFilter },
      select: { montant: true, mois: true },
    }),
  ]);

  const tresorerie =
    (ecrituresRecettes._sum.montant ?? 0) +
    (echeancesPayeesTotal._sum.montantRecu ?? 0) -
    (ecrituresDepenses._sum.montant ?? 0);
  const totalImpayes = echeancesImpayees.reduce((sum, e) => sum + e.montant, 0);
  const totalImpayesAnciens = echeancesImpayees
    .filter((e) => e.mois.getFullYear() < anneeActuelle)
    .reduce((sum, e) => sum + e.montant, 0);

  const mad = (n: number) => `${n.toLocaleString("fr-MA")} MAD`;

  return (
    <div className="space-y-6">
      <Header title="Tableau de bord" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Résidences gérées" value={residences.length} icon={Building2} />
        <KpiCard label="Lots" value={lotsCount} icon={DoorOpen} color="secondary" />
        <KpiCard
          label="Échéances non payées"
          value={impayesCount}
          icon={AlertTriangle}
          color="danger"
        />
        <KpiCard label="Plan" value={session.role === "SUPER_ADMIN" ? "Toutes organisations" : "—"} icon={Wallet} color="success" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-text-secondary">Situation financière</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Solde de trésorerie" value={mad(tresorerie)} icon={Wallet} color="primary" />
          <KpiCard
            label={`Payé en ${now.toLocaleDateString("fr-FR", { month: "long" })}`}
            value={mad(payeMois._sum.montantRecu ?? 0)}
            icon={TrendingUp}
            color="success"
          />
          <KpiCard
            label={`Cumul payé en ${anneeActuelle}`}
            value={mad(payeAnnee._sum.montantRecu ?? 0)}
            icon={History}
            color="success"
          />
          <KpiCard
            label="Total des impayés"
            value={mad(totalImpayes)}
            caption={
              totalImpayesAnciens > 0
                ? `dont ${mad(totalImpayesAnciens)} sur exercices antérieurs`
                : undefined
            }
            icon={AlertTriangle}
            color="danger"
            href="/impayes"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-text-secondary">Résidences</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {residences.map((residence) => (
            <ResidenceCard key={residence.id} residence={residence} />
          ))}
          {residences.length === 0 && (
            <p className="text-sm text-text-secondary">
              Aucune résidence pour le moment.{" "}
              <a href="/residences" className="text-primary hover:underline">
                En ajouter une
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
