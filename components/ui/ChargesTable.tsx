"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

export type ChargeRow = {
  id: string;
  lotNumero?: string;
  periode: string;
  montant: number;
  statut: "PAYE" | "EN_ATTENTE" | "EN_RETARD";
  datePaiement: string | null;
};

const NEXT_STATUS: Record<ChargeRow["statut"], ChargeRow["statut"]> = {
  EN_ATTENTE: "PAYE",
  EN_RETARD: "PAYE",
  PAYE: "EN_ATTENTE",
};

export function ChargesTable({
  rows,
  editable = false,
}: {
  rows: ChargeRow[];
  editable?: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleStatus(row: ChargeRow) {
    setPendingId(row.id);
    await fetch(`/api/quote-parts/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: NEXT_STATUS[row.statut] }),
    });
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-secondary">
            {rows.some((r) => r.lotNumero) && <th className="px-4 py-3 font-medium">Lot</th>}
            <th className="px-4 py-3 font-medium">Période</th>
            <th className="px-4 py-3 font-medium">Montant</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Date paiement</th>
            {editable && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              {row.lotNumero && (
                <td className="px-4 py-3 text-text-primary">{row.lotNumero}</td>
              )}
              <td className="px-4 py-3 text-text-primary">{row.periode}</td>
              <td className="px-4 py-3 text-text-primary">
                {row.montant.toLocaleString("fr-MA")} MAD
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.statut} size="sm" />
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {row.datePaiement
                  ? new Date(row.datePaiement).toLocaleDateString("fr-MA")
                  : "—"}
              </td>
              {editable && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(row)}
                    disabled={pendingId === row.id}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {row.statut === "PAYE" ? "Annuler paiement" : "Marquer payé"}
                  </button>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-text-secondary"
              >
                Aucune charge pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
