"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoproprietaireFinanceRow } from "./types";

const SITUATION_CONFIG: Record<CoproprietaireFinanceRow["situation"], { label: string; className: string }> = {
  A_JOUR: { label: "À jour", className: "bg-success/10 text-success" },
  EN_ATTENTE: { label: "En attente", className: "bg-warning/10 text-warning" },
  EN_RETARD: { label: "En retard", className: "bg-danger/10 text-danger" },
};

const STATUT_LABELS: Record<string, string> = {
  PAYE: "Payé",
  EN_ATTENTE: "En attente",
  EN_RETARD: "En retard",
};

function HistoriqueRow({ row }: { row: CoproprietaireFinanceRow }) {
  const [open, setOpen] = useState(false);

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
          <td colSpan={6} className="bg-bg-page px-4 py-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-secondary">
                  <th className="py-1 pr-4 font-medium">Année</th>
                  <th className="py-1 pr-4 font-medium">Période</th>
                  <th className="py-1 pr-4 font-medium">Montant</th>
                  <th className="py-1 pr-4 font-medium">Statut</th>
                  <th className="py-1 font-medium">Date paiement</th>
                </tr>
              </thead>
              <tbody>
                {row.historique.map((h, i) => (
                  <tr key={i} className={h.statut !== "PAYE" ? "text-danger" : "text-text-primary"}>
                    <td className="py-1 pr-4">{h.annee}</td>
                    <td className="py-1 pr-4">{h.periode}</td>
                    <td className="py-1 pr-4">{h.montant.toLocaleString("fr-MA")} MAD</td>
                    <td className="py-1 pr-4">{STATUT_LABELS[h.statut]}</td>
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
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
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
