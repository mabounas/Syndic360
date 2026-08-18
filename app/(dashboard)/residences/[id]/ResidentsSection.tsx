"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "En attente", className: "bg-warning/10 text-warning" },
  APPROUVE: { label: "Approuvé", className: "bg-success/10 text-success" },
  REJETE: { label: "Rejeté", className: "bg-danger/10 text-danger" },
  BLOQUE: { label: "Bloqué", className: "bg-danger/10 text-danger" },
};

export type ResidentRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  passwordSet: boolean;
  lots: string[];
};

function ResidentActions({ residenceId, userId, statut }: { residenceId: string; userId: string; statut: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatut(next: "APPROUVE" | "REJETE" | "BLOQUE") {
    setPending(true);
    await fetch(`/api/residences/${residenceId}/residents/${userId}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex gap-3 text-sm">
      {statut !== "APPROUVE" && (
        <button disabled={pending} onClick={() => setStatut("APPROUVE")} className="font-medium text-success hover:underline disabled:opacity-50">
          Approuver
        </button>
      )}
      {statut !== "REJETE" && (
        <button disabled={pending} onClick={() => setStatut("REJETE")} className="text-danger hover:underline disabled:opacity-50">
          Rejeter
        </button>
      )}
      {statut === "APPROUVE" && (
        <button disabled={pending} onClick={() => setStatut("BLOQUE")} className="text-warning hover:underline disabled:opacity-50">
          Bloquer
        </button>
      )}
    </div>
  );
}

export function ResidentsSection({
  residenceId,
  residents,
}: {
  residenceId: string;
  residents: ResidentRow[];
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <h2 className="font-medium text-text-primary">Résidents</h2>
      <div className="overflow-x-auto rounded-[var(--radius-button)] border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Lot(s)</th>
              <th className="px-4 py-3 font-medium">Compte</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-text-primary">{r.prenom} {r.nom}</td>
                <td className="px-4 py-3 text-text-secondary">{r.email}</td>
                <td className="px-4 py-3 text-text-secondary">{r.lots.join(", ")}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {r.passwordSet ? "Activé" : "En attente d'activation"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      STATUT_CONFIG[r.statut]?.className
                    )}
                  >
                    {STATUT_CONFIG[r.statut]?.label ?? r.statut}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ResidentActions residenceId={residenceId} userId={r.id} statut={r.statut} />
                </td>
              </tr>
            ))}
            {residents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                  Aucun résident pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
