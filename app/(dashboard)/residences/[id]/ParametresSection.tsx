"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResidenceSettings } from "./types";

const inputClass =
  "w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-sm font-medium text-text-secondary";

export function ParametresSection({ residence }: { residence: ResidenceSettings }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom: residence.nom,
    adresse: residence.adresse,
    ville: residence.ville,
    totalTantiemes: residence.totalTantiemes.toString(),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/residences/${residence.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          adresse: form.adresse,
          ville: form.ville,
          totalTantiemes: Number(form.totalTantiemes || 1000),
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
        <h2 className="mb-4 font-medium text-text-primary">Copropriété</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nom de la copropriété</label>
            <input
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Adresse de l&apos;immeuble</label>
            <input
              required
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ville</label>
            <input
              required
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Total des tantièmes</label>
            <input
              required
              type="number"
              min={1}
              value={form.totalTantiemes}
              onChange={(e) => setForm({ ...form, totalTantiemes: e.target.value })}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-text-secondary">
              Défini dans votre règlement de copropriété (1 000 en tantièmes, 10 000 en millièmes).
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-button)] bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span className="text-sm text-success">Enregistré.</span>}
      </div>
    </form>
  );
}
