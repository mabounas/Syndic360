"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, Pencil } from "lucide-react";
import type { BatimentWithLots, LotWithOwners } from "./types";

const LOT_TYPES = [
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "PARKING", label: "Parking" },
  { value: "CAVE", label: "Cave" },
] as const;

const OCCUPANT_LABELS: Record<string, string> = {
  PROPRIETAIRE: "Propriétaire",
  LOCATAIRE: "Locataire",
};

function NewBatimentForm({ residenceId }: { residenceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [nbEtages, setNbEtages] = useState("1");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await fetch("/api/batiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residenceId, nom, nbEtages: Number(nbEtages) }),
    });
    setPending(false);
    setOpen(false);
    setNom("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus size={14} /> Ajouter un bâtiment
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <input
        required
        placeholder="Nom du bâtiment"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        className="rounded-[var(--radius-button)] border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        type="number"
        min={0}
        placeholder="Étages"
        value={nbEtages}
        onChange={(e) => setNbEtages(e.target.value)}
        className="w-24 rounded-[var(--radius-button)] border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        Ajouter
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-text-secondary hover:underline"
      >
        Annuler
      </button>
    </form>
  );
}

function NewLotForm({ batimentId }: { batimentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    numero: "",
    type: "APPARTEMENT" as (typeof LOT_TYPES)[number]["value"],
    surface: "",
    tantiemesGeneraux: "",
    tantiemesCharges: "",
    etage: "",
    montantForfaitaire: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await fetch("/api/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batimentId,
        numero: form.numero,
        type: form.type,
        surface: form.surface ? Number(form.surface) : undefined,
        tantiemesGeneraux: Number(form.tantiemesGeneraux || 0),
        tantiemesCharges: Number(form.tantiemesCharges || 0),
        etage: form.etage ? Number(form.etage) : undefined,
        montantForfaitaire: form.montantForfaitaire ? Number(form.montantForfaitaire) : undefined,
      }),
    });
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus size={12} /> Lot
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-end gap-2 rounded-[var(--radius-button)] bg-bg-page p-3">
      <input
        required
        placeholder="Numéro"
        value={form.numero}
        onChange={(e) => setForm({ ...form, numero: e.target.value })}
        className="w-24 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      >
        {LOT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        placeholder="Étage"
        type="number"
        value={form.etage}
        onChange={(e) => setForm({ ...form, etage: e.target.value })}
        className="w-20 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        placeholder="Surface m²"
        type="number"
        value={form.surface}
        onChange={(e) => setForm({ ...form, surface: e.target.value })}
        className="w-24 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        placeholder="Tantièmes généraux"
        type="number"
        value={form.tantiemesGeneraux}
        onChange={(e) => setForm({ ...form, tantiemesGeneraux: e.target.value })}
        className="w-32 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        placeholder="Tantièmes charges"
        type="number"
        value={form.tantiemesCharges}
        onChange={(e) => setForm({ ...form, tantiemesCharges: e.target.value })}
        className="w-32 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        placeholder="Montant forfaitaire (MAD)"
        type="number"
        value={form.montantForfaitaire}
        onChange={(e) => setForm({ ...form, montantForfaitaire: e.target.value })}
        className="w-40 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        Ajouter
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-text-secondary hover:underline"
      >
        Annuler
      </button>
    </form>
  );
}

function EditForfaitForm({ lotId, montantForfaitaire }: { lotId: string; montantForfaitaire: number | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState(montantForfaitaire?.toString() ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await fetch(`/api/lots/${lotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montantForfaitaire: Number(value || 0) }),
    });
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-text-secondary hover:text-primary"
        title="Modifier le montant forfaitaire"
      >
        {montantForfaitaire !== null ? `${montantForfaitaire} MAD/forfait` : "Forfait non défini"}
        <Pencil size={11} />
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-1">
      <input
        autoFocus
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 rounded-[var(--radius-button)] border border-border px-1.5 py-0.5 text-xs outline-none focus:border-primary"
      />
      <button type="submit" disabled={pending} className="text-xs text-primary hover:underline">
        OK
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-secondary hover:underline">
        Annuler
      </button>
    </form>
  );
}

function AssignProprietaireForm({ lotId }: { lotId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    typeOccupant: "PROPRIETAIRE" as "PROPRIETAIRE" | "LOCATAIRE",
    password: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/lots/${lotId}/proprietaires`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
        <UserPlus size={12} /> Assigner un occupant
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-end gap-2 rounded-[var(--radius-button)] bg-bg-page p-3">
      <input
        required
        placeholder="Prénom"
        value={form.prenom}
        onChange={(e) => setForm({ ...form, prenom: e.target.value })}
        className="w-28 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        placeholder="Nom"
        value={form.nom}
        onChange={(e) => setForm({ ...form, nom: e.target.value })}
        className="w-28 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-48 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        placeholder="Téléphone"
        value={form.telephone}
        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
        className="w-36 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <select
        value={form.typeOccupant}
        onChange={(e) => setForm({ ...form, typeOccupant: e.target.value as typeof form.typeOccupant })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      >
        <option value="PROPRIETAIRE">Propriétaire</option>
        <option value="LOCATAIRE">Locataire</option>
      </select>
      <input
        type="password"
        placeholder="Mot de passe (optionnel)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-48 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        Créer
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-text-secondary hover:underline"
      >
        Annuler
      </button>
      <p className="w-full text-xs text-text-secondary">
        Laissez le mot de passe vide pour que la personne active elle-même son compte sur{" "}
        <span className="font-medium">/activer-mon-compte</span> (vérification nom, prénom, email).
      </p>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}

function LotRow({ lot }: { lot: LotWithOwners }) {
  return (
    <div className="border-t border-border py-2 first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium text-text-primary">{lot.numero}</span>{" "}
          <span className="text-text-secondary">
            · {lot.type.toLowerCase()}
            {lot.etage !== null ? ` · étage ${lot.etage}` : ""}
            {lot.surface ? ` · ${lot.surface} m²` : ""} · {lot.tantiemesCharges}‰ charges ·{" "}
          </span>
          <EditForfaitForm lotId={lot.id} montantForfaitaire={lot.montantForfaitaire} />
        </div>
        <div className="text-sm text-text-secondary">
          {lot.proprietaires.length > 0
            ? lot.proprietaires
                .map(
                  (p) =>
                    `${p.user.prenom} ${p.user.nom} (${OCCUPANT_LABELS[p.typeOccupant]}${
                      p.user.telephone ? ` · ${p.user.telephone}` : ""
                    })`
                )
                .join(", ")
            : <AssignProprietaireForm lotId={lot.id} />}
        </div>
      </div>
    </div>
  );
}

export function BatimentsSection({
  residenceId,
  batiments,
}: {
  residenceId: string;
  batiments: BatimentWithLots[];
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-text-primary">Bâtiments &amp; lots</h2>
        <NewBatimentForm residenceId={residenceId} />
      </div>

      {batiments.map((batiment) => (
        <div key={batiment.id} className="rounded-[var(--radius-button)] border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">
              {batiment.nom} <span className="text-text-secondary">({batiment.nbEtages} étages)</span>
            </p>
            <NewLotForm batimentId={batiment.id} />
          </div>
          <div>
            {batiment.lots.map((lot) => (
              <LotRow key={lot.id} lot={lot} />
            ))}
            {batiment.lots.length === 0 && (
              <p className="py-2 text-sm text-text-secondary">Aucun lot.</p>
            )}
          </div>
        </div>
      ))}
      {batiments.length === 0 && (
        <p className="text-sm text-text-secondary">Aucun bâtiment pour le moment.</p>
      )}
    </div>
  );
}
