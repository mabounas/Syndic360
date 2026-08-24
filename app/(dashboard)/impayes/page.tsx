import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "En attente", className: "bg-warning/10 text-warning" },
  EN_RETARD: { label: "En retard", className: "bg-danger/10 text-danger" },
};

export default async function ImpayesPage() {
  const session = await requireSession();
  if (!isStaffRole(session.role)) redirect("/mes-charges");

  const where = residenceScopeWhere(session);
  const anneeActuelle = new Date().getFullYear();

  const quoteParts = await prisma.quotePart.findMany({
    where: { statut: { not: "PAYE" }, lot: { batiment: { residence: where } } },
    orderBy: [{ appelCharges: { budget: { annee: "desc" } } }, { appelCharges: { dateEcheance: "desc" } }],
    select: {
      id: true,
      montant: true,
      statut: true,
      lot: {
        select: {
          numero: true,
          batiment: { select: { residence: { select: { id: true, nom: true } } } },
          proprietaires: { select: { user: { select: { nom: true, prenom: true, email: true } } } },
        },
      },
      appelCharges: {
        select: { periode: true, dateEcheance: true, budget: { select: { annee: true } } },
      },
    },
  });

  const exerciceEnCours = quoteParts.filter((qp) => qp.appelCharges.budget.annee === anneeActuelle);
  const exercicesAnterieurs = quoteParts.filter((qp) => qp.appelCharges.budget.annee < anneeActuelle);

  function Table({ rows }: { rows: typeof quoteParts }) {
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
              <th className="px-4 py-3 font-medium">Année</th>
              <th className="px-4 py-3 font-medium">Période</th>
              <th className="px-4 py-3 font-medium">Échéance</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((qp) => (
              <tr key={qp.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/residences/${qp.lot.batiment.residence.id}`} className="text-primary hover:underline">
                    {qp.lot.batiment.residence.nom}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">{qp.lot.numero}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {qp.lot.proprietaires.length > 0
                    ? qp.lot.proprietaires.map((p) => `${p.user.prenom} ${p.user.nom}`).join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-text-secondary">{qp.appelCharges.budget.annee}</td>
                <td className="px-4 py-3 text-text-secondary">{qp.appelCharges.periode}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(qp.appelCharges.dateEcheance).toLocaleDateString("fr-MA")}
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {qp.montant.toLocaleString("fr-MA")} MAD
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      STATUT_CONFIG[qp.statut]?.className
                    )}
                  >
                    {STATUT_CONFIG[qp.statut]?.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const totalEnCours = exerciceEnCours.reduce((s, qp) => s + qp.montant, 0);
  const totalAnterieur = exercicesAnterieurs.reduce((s, qp) => s + qp.montant, 0);

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
