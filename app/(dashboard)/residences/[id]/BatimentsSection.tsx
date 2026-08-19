"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BatimentWithLots, LotWithOwners } from "./types";

const LOT_TYPES = [
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "PARKING", label: "Parking" },
  { value: "CAVE", label: "Cave" },
] as const;

const LOT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  LOT_TYPES.map((t) => [t.value, t.label])
);

const OCCUPANT_LABELS: Record<string, string> = {
  PROPRIETAIRE: "Propriétaire",
  LOCATAIRE: "Locataire",
};

const cellClass = "px-3 py-2.5 align-top";
const inputClass =
  "w-full rounded-[var(--radius-button)] border border-border px-2 py-1 text-sm outline-none focus:border-primary";

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

function AssignProprietaireForm({ lotId, onDone }: { lotId: string; onDone: () => void }) {
  const router = useRouter();
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
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-[var(--radius-button)] bg-bg-page p-3">
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
      <button type="button" onClick={onDone} className="text-sm text-text-secondary hover:underline">
        Annuler
      </button>
      <p className="w-full text-xs text-text-secondary">
        Laissez le mot de passe vide pour que la personne active elle-même son compte sur{" "}
        <span className="font-medium">/register</span> (choix « Copropriétaire », vérification nom, prénom, email).
      </p>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}

type LotEditState = {
  numero: string;
  type: (typeof LOT_TYPES)[number]["value"];
  etage: string;
  surface: string;
  tantiemesGeneraux: string;
  tantiemesCharges: string;
  montantForfaitaire: string;
};

function toEditState(lot: LotWithOwners): LotEditState {
  return {
    numero: lot.numero,
    type: lot.type,
    etage: lot.etage?.toString() ?? "",
    surface: lot.surface?.toString() ?? "",
    tantiemesGeneraux: lot.tantiemesGeneraux.toString(),
    tantiemesCharges: lot.tantiemesCharges.toString(),
    montantForfaitaire: lot.montantForfaitaire?.toString() ?? "",
  };
}

function LotEditModal({ lot, onClose }: { lot: LotWithOwners; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<LotEditState>(() => toEditState(lot));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/lots/${lot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: form.numero,
          type: form.type,
          etage: form.etage ? Number(form.etage) : null,
          surface: form.surface ? Number(form.surface) : null,
          tantiemesGeneraux: Number(form.tantiemesGeneraux || 0),
          tantiemesCharges: Number(form.tantiemesCharges || 0),
          montantForfaitaire: form.montantForfaitaire ? Number(form.montantForfaitaire) : null,
        }),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Modifier le lot {lot.numero}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-danger">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Numéro</label>
              <input
                required
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as LotEditState["type"] })}
                className={inputClass}
              >
                {LOT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Étage</label>
              <input
                type="number"
                value={form.etage}
                onChange={(e) => setForm({ ...form, etage: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Surface (m²)</label>
              <input
                type="number"
                value={form.surface}
                onChange={(e) => setForm({ ...form, surface: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Tantièmes généraux</label>
              <input
                type="number"
                value={form.tantiemesGeneraux}
                onChange={(e) => setForm({ ...form, tantiemesGeneraux: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Tantièmes charges</label>
              <input
                type="number"
                value={form.tantiemesCharges}
                onChange={(e) => setForm({ ...form, tantiemesCharges: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Montant forfaitaire (MAD)</label>
            <input
              type="number"
              value={form.montantForfaitaire}
              onChange={(e) => setForm({ ...form, montantForfaitaire: e.target.value })}
              className={inputClass}
            />
          </div>

          {lot.proprietaires.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-text-secondary">Occupant(s)</p>
              <div className="rounded-[var(--radius-button)] bg-bg-page p-2.5 text-sm">
                {lot.proprietaires.map((p) => (
                  <div key={p.user.id} className="text-text-secondary">
                    <span className="font-medium text-text-primary">
                      {p.user.prenom} {p.user.nom}
                    </span>{" "}
                    <span className="text-xs">
                      ({OCCUPANT_LABELS[p.typeOccupant]}
                      {p.user.telephone ? ` · ${p.user.telephone}` : ""})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm text-text-secondary hover:underline">
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {pending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LotTableRow({ lot }: { lot: LotWithOwners }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  return (
    <>
      <tr className="border-t border-border">
        <td className={cellClass}>
          <span className="font-medium text-text-primary">{lot.numero}</span>
        </td>
        <td className={cellClass}>
          <span className="text-text-secondary">{LOT_TYPE_LABELS[lot.type]}</span>
        </td>
        <td className={cellClass}>
          <span className="text-text-secondary">{lot.etage ?? "—"}</span>
        </td>
        <td className={cellClass}>
          <span className="text-text-secondary">{lot.surface ? `${lot.surface} m²` : "—"}</span>
        </td>
        <td className={cellClass}>
          <span className="text-text-secondary">{lot.tantiemesGeneraux}‰</span>
        </td>
        <td className={cellClass}>
          <span className="text-text-secondary">{lot.tantiemesCharges}‰</span>
        </td>
        <td className={cellClass}>
          <span className="text-text-secondary">
            {lot.montantForfaitaire !== null ? `${lot.montantForfaitaire} MAD` : "—"}
          </span>
        </td>
        <td className={cellClass}>
          {lot.proprietaires.length > 0 ? (
            <div className="space-y-0.5">
              {lot.proprietaires.map((p) => (
                <div key={p.user.id} className="text-text-secondary">
                  <span className="font-medium text-text-primary">
                    {p.user.prenom} {p.user.nom}
                  </span>{" "}
                  <span className="text-xs">
                    ({OCCUPANT_LABELS[p.typeOccupant]}
                    {p.user.telephone ? ` · ${p.user.telephone}` : ""})
                  </span>
                </div>
              ))}
            </div>
          ) : assigning ? (
            <span className="text-xs text-text-secondary">Formulaire ci-dessous</span>
          ) : (
            <button
              onClick={() => setAssigning(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <UserPlus size={12} /> Assigner un occupant
            </button>
          )}
        </td>
        <td className={cn(cellClass, "text-right")}>
          <button
            onClick={() => setModalOpen(true)}
            title="Modifier ce lot"
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary"
          >
            <Pencil size={13} /> Modifier
          </button>
        </td>
      </tr>
      {assigning && (
        <tr className="border-t border-border">
          <td colSpan={9} className="px-3 py-2.5">
            <AssignProprietaireForm lotId={lot.id} onDone={() => setAssigning(false)} />
          </td>
        </tr>
      )}
      {modalOpen && <LotEditModal lot={lot} onClose={() => setModalOpen(false)} />}
    </>
  );
}

function LotsTable({ lots }: { lots: LotWithOwners[] }) {
  if (lots.length === 0) {
    return <p className="py-2 text-sm text-text-secondary">Aucun lot.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            <th className={cellClass}>Lot</th>
            <th className={cellClass}>Type</th>
            <th className={cellClass}>Étage</th>
            <th className={cellClass}>Surface</th>
            <th className={cellClass}>Tant. généraux</th>
            <th className={cellClass}>Tant. charges</th>
            <th className={cellClass}>Forfait</th>
            <th className={cellClass}>Occupant(s)</th>
            <th className={cellClass} />
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <LotTableRow key={lot.id} lot={lot} />
          ))}
        </tbody>
      </table>
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
          <LotsTable lots={batiment.lots} />
        </div>
      ))}
      {batiments.length === 0 && (
        <p className="text-sm text-text-secondary">Aucun bâtiment pour le moment.</p>
      )}
    </div>
  );
}
