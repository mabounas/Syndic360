"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { EcritureRow } from "./types";

const CATEGORIES = [
  "Entretien courant",
  "Assurances",
  "Gardiennage",
  "Travaux",
  "Fonds travaux",
  "Charges perçues",
  "Autre",
];

function NewEcritureForm({ residenceId }: { residenceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    date: "",
    libelle: "",
    type: "DEPENSE" as "RECETTE" | "DEPENSE",
    montant: "",
    categorie: CATEGORIES[0],
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await fetch("/api/ecritures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residenceId, ...form, montant: Number(form.montant) }),
    });
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus size={14} /> Saisir une opération
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-[var(--radius-button)] bg-bg-page p-3">
      <input
        required
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      >
        <option value="DEPENSE">Dépense</option>
        <option value="RECETTE">Recette</option>
      </select>
      <input
        required
        placeholder="Libellé"
        value={form.libelle}
        onChange={(e) => setForm({ ...form, libelle: e.target.value })}
        className="w-48 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <select
        value={form.categorie}
        onChange={(e) => setForm({ ...form, categorie: e.target.value })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        required
        type="number"
        placeholder="Montant (MAD)"
        value={form.montant}
        onChange={(e) => setForm({ ...form, montant: e.target.value })}
        className="w-32 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        Enregistrer
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:underline">
        Annuler
      </button>
    </form>
  );
}

export function ComptabiliteSection({
  residenceId,
  ecritures,
}: {
  residenceId: string;
  ecritures: EcritureRow[];
}) {
  const parAnnee = useMemo(() => {
    const map = new Map<number, { recettes: number; depenses: number }>();
    for (const e of ecritures) {
      const annee = new Date(e.date).getFullYear();
      const entry = map.get(annee) ?? { recettes: 0, depenses: 0 };
      if (e.type === "RECETTE") entry.recettes += e.montant;
      else entry.depenses += e.montant;
      map.set(annee, entry);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [ecritures]);

  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-text-primary">Comptabilité</h2>
        <NewEcritureForm residenceId={residenceId} />
      </div>

      {parAnnee.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {parAnnee.map(([annee, { recettes, depenses }]) => (
            <div key={annee} className="rounded-[var(--radius-button)] bg-bg-page p-3 text-sm">
              <p className="font-medium text-text-primary">Compte de gestion {annee}</p>
              <p className="text-success">Recettes : {recettes.toLocaleString("fr-MA")} MAD</p>
              <p className="text-danger">Dépenses : {depenses.toLocaleString("fr-MA")} MAD</p>
              <p className="mt-1 font-medium text-text-primary">
                Solde : {(recettes - depenses).toLocaleString("fr-MA")} MAD
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-[var(--radius-button)] border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Libellé</th>
              <th className="px-3 py-2 font-medium">Catégorie</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            {ecritures.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-text-secondary">
                  {new Date(e.date).toLocaleDateString("fr-MA")}
                </td>
                <td className="px-3 py-2 text-text-primary">{e.libelle}</td>
                <td className="px-3 py-2 text-text-secondary">{e.categorie}</td>
                <td className={e.type === "RECETTE" ? "px-3 py-2 text-success" : "px-3 py-2 text-danger"}>
                  {e.type === "RECETTE" ? "Recette" : "Dépense"}
                </td>
                <td className="px-3 py-2 text-text-primary">{e.montant.toLocaleString("fr-MA")} MAD</td>
              </tr>
            ))}
            {ecritures.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-text-secondary">
                  Aucune écriture pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
