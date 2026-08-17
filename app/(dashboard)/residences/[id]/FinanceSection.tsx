"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ChargesTable } from "@/components/ui/ChargesTable";
import type { BudgetWithAppels } from "./types";

function NewBudgetForm({ residenceId }: { residenceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    annee: String(new Date().getFullYear()),
    montantTotal: "",
    fondsTravauxMin: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residenceId,
        annee: Number(form.annee),
        montantTotal: Number(form.montantTotal),
        fondsTravauxMin: Number(form.fondsTravauxMin || 0),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Erreur.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus size={14} /> Nouveau budget
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <input
        required
        type="number"
        placeholder="Année"
        value={form.annee}
        onChange={(e) => setForm({ ...form, annee: e.target.value })}
        className="w-24 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        type="number"
        placeholder="Montant total (MAD)"
        value={form.montantTotal}
        onChange={(e) => setForm({ ...form, montantTotal: e.target.value })}
        className="w-40 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        type="number"
        placeholder="Fonds travaux min (MAD)"
        value={form.fondsTravauxMin}
        onChange={(e) => setForm({ ...form, fondsTravauxMin: e.target.value })}
        className="w-44 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        Créer
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:underline">
        Annuler
      </button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}

function NewAppelChargesForm({ budgetId }: { budgetId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ periode: "", dateEcheance: "", montantTotal: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/appels-charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budgetId,
        periode: form.periode,
        dateEcheance: form.dateEcheance,
        montantTotal: Number(form.montantTotal),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Erreur.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus size={12} /> Nouvel appel de charges
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-end gap-2 rounded-[var(--radius-button)] bg-bg-page p-3">
      <input
        required
        placeholder="Période (ex. T1 2026)"
        value={form.periode}
        onChange={(e) => setForm({ ...form, periode: e.target.value })}
        className="w-40 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        type="date"
        value={form.dateEcheance}
        onChange={(e) => setForm({ ...form, dateEcheance: e.target.value })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        type="number"
        placeholder="Montant total (MAD)"
        value={form.montantTotal}
        onChange={(e) => setForm({ ...form, montantTotal: e.target.value })}
        className="w-40 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        Créer et répartir
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:underline">
        Annuler
      </button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}

export function FinanceSection({
  residenceId,
  budgets,
}: {
  residenceId: string;
  budgets: BudgetWithAppels[];
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-text-primary">Budgets &amp; appels de charges</h2>
        <NewBudgetForm residenceId={residenceId} />
      </div>

      {budgets.map((budget) => (
        <div key={budget.id} className="rounded-[var(--radius-button)] border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">
              Budget {budget.annee}{" "}
              <span className="text-text-secondary">
                · {budget.montantTotal.toLocaleString("fr-MA")} MAD
              </span>
            </p>
            <NewAppelChargesForm budgetId={budget.id} />
          </div>

          <div className="mt-3 space-y-3">
            {budget.appelsCharges.map((appel) => (
              <div key={appel.id}>
                <p className="mb-1 text-sm text-text-secondary">
                  {appel.periode} — échéance{" "}
                  {new Date(appel.dateEcheance).toLocaleDateString("fr-MA")}
                </p>
                <ChargesTable
                  editable
                  rows={appel.quoteParts.map((qp) => ({
                    id: qp.id,
                    lotNumero: qp.lot.numero,
                    periode: appel.periode,
                    montant: qp.montant,
                    statut: qp.statut,
                    datePaiement: qp.datePaiement ? qp.datePaiement.toISOString() : null,
                  }))}
                />
              </div>
            ))}
            {budget.appelsCharges.length === 0 && (
              <p className="text-sm text-text-secondary">Aucun appel de charges.</p>
            )}
          </div>
        </div>
      ))}
      {budgets.length === 0 && (
        <p className="text-sm text-text-secondary">Aucun budget pour le moment.</p>
      )}
    </div>
  );
}
