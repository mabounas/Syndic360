"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoproprietaireFinanceRow } from "./types";

const SITUATION_CONFIG: Record<CoproprietaireFinanceRow["situation"], { label: string; className: string }> = {
  A_JOUR: { label: "À jour", className: "bg-success/10 text-success" },
  EN_RETARD: { label: "En retard", className: "bg-danger/10 text-danger" },
};

const STATUT_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  NON_PAYE: "Non payé",
  PAYE: "Payé",
};

function moisLabel(mois: Date) {
  return new Date(mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function computeStats(historique: CoproprietaireFinanceRow["historique"]) {
  const anneeCourante = new Date().getFullYear();
  let impayesExerciceCourant = 0;
  let impayesExercicesPrecedents = 0;
  let payeExerciceCourant = 0;
  let dernierPaiement: { date: Date; montant: number } | null = null;

  for (const h of historique) {
    const annee = new Date(h.mois).getFullYear();
    if (h.statut === "NON_PAYE") {
      if (annee === anneeCourante) impayesExerciceCourant += h.montant;
      else if (annee < anneeCourante) impayesExercicesPrecedents += h.montant;
    }
    if (h.statut === "PAYE") {
      const montant = h.montantRecu ?? h.montant;
      if (annee === anneeCourante) payeExerciceCourant += montant;
      const datePaiement = new Date(h.datePaiement ?? h.mois);
      if (!dernierPaiement || datePaiement.getTime() > dernierPaiement.date.getTime()) {
        dernierPaiement = { date: datePaiement, montant };
      }
    }
  }

  return { impayesExerciceCourant, impayesExercicesPrecedents, payeExerciceCourant, dernierPaiement };
}

function HistoriqueRow({ row }: { row: CoproprietaireFinanceRow }) {
  const [open, setOpen] = useState(false);
  const stats = computeStats(row.historique);

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-3 font-medium text-text-primary">{row.lotNumero}</td>
        <td className="px-4 py-3 text-text-secondary">
          {row.occupants.length > 0
            ? row.occupants.map((o) => `${o.prenom} ${o.nom}`).join(", ")
            : "—"}
        </td>
        <td className="px-4 py-3 text-text-secondary">
          {row.occupants.length > 0 ? row.occupants.map((o) => o.email).join(", ") : "—"}
        </td>
        <td className="px-4 py-3 text-text-secondary">
          {row.soldeDepart.toLocaleString("fr-MA")} MAD
        </td>
        <td className="px-4 py-3 font-medium text-text-primary">
          {row.soldeComptable.toLocaleString("fr-MA")} MAD
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
              SITUATION_CONFIG[row.situation].className
            )}
          >
            {SITUATION_CONFIG[row.situation].label}
          </span>
        </td>
        <td className="px-4 py-3">
          {row.historique.length > 0 && (
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Historique {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </td>
      </tr>
      {open && (
        <tr className="border-b border-border last:border-0">
          <td colSpan={7} className="bg-bg-page px-4 py-3">
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[var(--radius-button)] bg-bg-card p-3 text-xs">
                <p className="text-text-secondary">Impayés exercice en cours</p>
                <p className="mt-1 font-medium text-danger">
                  {stats.impayesExerciceCourant.toLocaleString("fr-MA")} MAD
                </p>
              </div>
              <div className="rounded-[var(--radius-button)] bg-bg-card p-3 text-xs">
                <p className="text-text-secondary">Impayés exercices précédents</p>
                <p className="mt-1 font-medium text-danger">
                  {stats.impayesExercicesPrecedents.toLocaleString("fr-MA")} MAD
                </p>
              </div>
              <div className="rounded-[var(--radius-button)] bg-bg-card p-3 text-xs">
                <p className="text-text-secondary">Payé exercice en cours</p>
                <p className="mt-1 font-medium text-success">
                  {stats.payeExerciceCourant.toLocaleString("fr-MA")} MAD
                </p>
              </div>
              <div className="rounded-[var(--radius-button)] bg-bg-card p-3 text-xs">
                <p className="text-text-secondary">Dernier paiement</p>
                <p className="mt-1 font-medium text-text-primary">
                  {stats.dernierPaiement
                    ? `${stats.dernierPaiement.montant.toLocaleString("fr-MA")} MAD — ${stats.dernierPaiement.date.toLocaleDateString("fr-MA")}`
                    : "—"}
                </p>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-secondary">
                  <th className="py-1 pr-4 font-medium">Mois</th>
                  <th className="py-1 pr-4 font-medium">Montant</th>
                  <th className="py-1 pr-4 font-medium">Statut</th>
                  <th className="py-1 pr-4 font-medium">Montant reçu</th>
                  <th className="py-1 font-medium">Date paiement</th>
                </tr>
              </thead>
              <tbody>
                {row.historique.map((h, i) => (
                  <tr key={i} className={h.statut === "NON_PAYE" ? "text-danger" : "text-text-primary"}>
                    <td className="py-1 pr-4 capitalize">{moisLabel(h.mois)}</td>
                    <td className="py-1 pr-4">{h.montant.toLocaleString("fr-MA")} MAD</td>
                    <td className="py-1 pr-4">{STATUT_LABELS[h.statut]}</td>
                    <td className="py-1 pr-4">
                      {h.montantRecu !== null ? `${h.montantRecu.toLocaleString("fr-MA")} MAD` : "—"}
                    </td>
                    <td className="py-1">
                      {h.datePaiement ? new Date(h.datePaiement).toLocaleDateString("fr-MA") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export function CoproprietaireFinanceSection({ rows }: { rows: CoproprietaireFinanceRow[] }) {
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <h2 className="font-medium text-text-primary">Situation comptable par copropriétaire</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-medium">Lot</th>
              <th className="px-4 py-3 font-medium">Copropriétaire</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Solde de départ</th>
              <th className="px-4 py-3 font-medium">Solde comptable</th>
              <th className="px-4 py-3 font-medium">Situation</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <HistoriqueRow key={row.lotId} row={row} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                  Aucun lot pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
