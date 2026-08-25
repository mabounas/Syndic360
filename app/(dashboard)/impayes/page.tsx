import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { actualiserEcheancesEchues } from "@/lib/echeancier";
import { cn } from "@/lib/utils";

export default async function ImpayesPage() {
  const session = await requireSession();
  if (!isStaffRole(session.role)) redirect("/mes-charges");

  const where = residenceScopeWhere(session);
  const anneeActuelle = new Date().getFullYear();

  await actualiserEcheancesEchues(where);

  const echeances = await prisma.echeance.findMany({
    where: { statut: "NON_PAYE", lot: { batiment: { residence: where } } },
    orderBy: [{ mois: "desc" }],
    select: {
      id: true,
      montant: true,
      mois: true,
      lot: {
        select: {
          numero: true,
          batiment: { select: { residence: { select: { id: true, nom: true } } } },
          proprietaires: { select: { user: { select: { nom: true, prenom: true, email: true } } } },
        },
      },
    },
  });

  const exerciceEnCours = echeances.filter((e) => e.mois.getFullYear() === anneeActuelle);
  const exercicesAnterieurs = echeances.filter((e) => e.mois.getFullYear() < anneeActuelle);

  function Table({ rows }: { rows: typeof echeances }) {
    if (rows.length === 0) {
      return <p className="px-4 py-6 text-center text-sm text-text-secondary">Aucun impayé.</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-medium">Résidence</th>
              <th className="px-4 py-3 font-medium">Lot</th>
              <th className="px-4 py-3 font-medium">Copropriétaire</th>
              <th className="px-4 py-3 font-medium">Mois</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/residences/${e.lot.batiment.residence.id}`} className="text-primary hover:underline">
                    {e.lot.batiment.residence.nom}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">{e.lot.numero}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {e.lot.proprietaires.length > 0
                    ? e.lot.proprietaires.map((p) => `${p.user.prenom} ${p.user.nom}`).join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(e.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {e.montant.toLocaleString("fr-MA")} MAD
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", "bg-danger/10 text-danger")}>
                    Non payé
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const totalEnCours = exerciceEnCours.reduce((s, e) => s + e.montant, 0);
  const totalAnterieur = exercicesAnterieurs.reduce((s, e) => s + e.montant, 0);

  return (
    <div className="space-y-6">
      <Header title="Impayés" />

      <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-text-primary">Exercice {anneeActuelle}</h2>
          <span className="text-sm font-medium text-danger">{totalEnCours.toLocaleString("fr-MA")} MAD</span>
        </div>
        <Table rows={exerciceEnCours} />
      </div>

      <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-text-primary">Exercices antérieurs</h2>
          <span className="text-sm font-medium text-danger">{totalAnterieur.toLocaleString("fr-MA")} MAD</span>
        </div>
        <Table rows={exercicesAnterieurs} />
      </div>
    </div>
  );
}
