"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Organisation = {
  id: string;
  nom: string;
  iban: string | null;
  bic: string | null;
  contactPrenom: string | null;
  contactNom: string | null;
  contactEmail: string | null;
  contactTelephone: string | null;
};

const inputClass =
  "w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-sm font-medium text-text-secondary";

export function OrganisationSettingsForm({ organisation }: { organisation: Organisation }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    iban: organisation.iban ?? "",
    bic: organisation.bic ?? "",
    contactPrenom: organisation.contactPrenom ?? "",
    contactNom: organisation.contactNom ?? "",
    contactEmail: organisation.contactEmail ?? "",
    contactTelephone: organisation.contactTelephone ?? "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    try {
      const res = await fetch("/api/organisation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <h2 className="mb-4 font-medium text-text-primary">Coordonnées bancaires</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>IBAN</label>
            <input
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: e.target.value })}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>BIC / SWIFT</label>
            <input
              value={form.bic}
              onChange={(e) => setForm({ ...form, bic: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Ces coordonnées apparaissent sur les appels de fonds et les courriers de relance.
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
        <h2 className="mb-4 font-medium text-text-primary">Contact syndic</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Prénom</label>
            <input
              value={form.contactPrenom}
              onChange={(e) => setForm({ ...form, contactPrenom: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input
              value={form.contactNom}
              onChange={(e) => setForm({ ...form, contactNom: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email de contact</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input
              value={form.contactTelephone}
              onChange={(e) => setForm({ ...form, contactTelephone: e.target.value })}
              className={inputClass}
            />
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
