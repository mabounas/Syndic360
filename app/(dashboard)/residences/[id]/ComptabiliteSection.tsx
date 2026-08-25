"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { KpiCard } from "@/components/ui/KpiCard";
import { cn } from "@/lib/utils";
import type { EcritureRow, EcheanceRow } from "./types";

const CATEGORIES = [
  "Entretien courant",
  "Assurances",
  "Gardiennage",
  "Travaux",
  "Fonds travaux",
  "Charges perçues",
  "Autre",
];

const DEPENSE_CATEGORIES = [
  "606 - Eau / Électricité",
  "615 - Entretien / Réparations",
  "616 - Assurances",
  "621 - Gardiennage / Personnel",
  "622 - Honoraires syndic",
  "623 - Nettoyage",
  "627 - Frais bancaires",
  "635 - Impôts et taxes",
  "Autre",
];

const ECHEANCE_STATUT_CONFIG: Record<EcheanceRow["statut"], { label: string; className: string }> = {
  EN_COURS: { label: "En cours", className: "bg-secondary/10 text-secondary" },
  NON_PAYE: { label: "Non payé", className: "bg-danger/10 text-danger" },
  PAYE: { label: "Payé", className: "bg-success/10 text-success" },
};

const ECHEANCE_TABS = [
  { key: "TOUS", label: "Tous" },
  { key: "EN_COURS", label: "En cours" },
  { key: "NON_PAYE", label: "Non payé" },
  { key: "PAYE", label: "Payé" },
] as const;

const inputClass =
  "w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-text-secondary";

function moisLabel(mois: Date) {
  return new Date(mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function occupantLabel(lot: EcheanceRow["lot"]) {
  return lot.proprietaires.map((p) => `${p.user.prenom} ${p.user.nom}`).join(", ") || "—";
}

// ---------- Enregistrer un paiement (par échéance) ----------

function EcheanceUpdateModal({ echeance, onClose }: { echeance: EcheanceRow; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    montantRecu: (echeance.montantRecu ?? echeance.montant).toString(),
    datePaiement: echeance.datePaiement
      ? new Date(echeance.datePaiement).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    referencePaiement: echeance.referencePaiement ?? "",
    statut: (echeance.statut === "PAYE" ? "PAYE" : "NON_PAYE") as "PAYE" | "NON_PAYE",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/echeances/${echeance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statut: form.statut,
          montantRecu: form.montantRecu ? Number(form.montantRecu) : null,
          datePaiement: form.datePaiement || null,
          referencePaiement: form.referencePaiement || null,
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
    <Modal title={`Paiement — Lot ${echeance.lot.numero} · ${moisLabel(echeance.mois)}`} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-text-secondary">
          {occupantLabel(echeance.lot)} — {echeance.montant.toLocaleString("fr-MA")} MAD dus
        </p>
        <div>
          <label className={labelClass}>Montant reçu (MAD)</label>
          <input
            type="number"
            value={form.montantRecu}
            onChange={(e) => setForm({ ...form, montantRecu: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              value={form.datePaiement}
              onChange={(e) => setForm({ ...form, datePaiement: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Référence</label>
            <input
              placeholder="Ex: VIR-20260401 ou CHQ-1234"
              value={form.referencePaiement}
              onChange={(e) => setForm({ ...form, referencePaiement: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Statut</label>
          <select
            value={form.statut}
            onChange={(e) => setForm({ ...form, statut: e.target.value as "PAYE" | "NON_PAYE" })}
            className={inputClass}
          >
            <option value="PAYE">Payé</option>
            <option value="NON_PAYE">Non payé</option>
          </select>
        </div>
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
    </Modal>
  );
}

function EcheanceTableRow({ echeance }: { echeance: EcheanceRow }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-3 font-medium text-text-primary">{echeance.lot.numero}</td>
        <td className="px-4 py-3 text-text-secondary">{occupantLabel(echeance.lot)}</td>
        <td className="px-4 py-3 text-text-secondary">{moisLabel(echeance.mois)}</td>
        <td className="px-4 py-3 font-medium text-text-primary">{echeance.montant.toLocaleString("fr-MA")} MAD</td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
              ECHEANCE_STATUT_CONFIG[echeance.statut].className
            )}
          >
            {ECHEANCE_STATUT_CONFIG[echeance.statut].label}
          </span>
        </td>
        <td className="px-4 py-3 text-text-secondary">
          {echeance.montantRecu !== null ? `${echeance.montantRecu.toLocaleString("fr-MA")} MAD` : "—"}
        </td>
        <td className="px-4 py-3 text-text-secondary">{echeance.referencePaiement ?? "—"}</td>
        <td className="px-4 py-3">
          <button onClick={() => setModalOpen(true)} className="text-xs font-medium text-primary hover:underline">
            Enregistrer un paiement
          </button>
        </td>
      </tr>
      {modalOpen && <EcheanceUpdateModal echeance={echeance} onClose={() => setModalOpen(false)} />}
    </>
  );
}

function EcheancierSection({ echeances }: { echeances: EcheanceRow[] }) {
  const [tab, setTab] = useState<(typeof ECHEANCE_TABS)[number]["key"]>("TOUS");
  const filtered = tab === "TOUS" ? echeances : echeances.filter((e) => e.statut === tab);

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-text-primary">Échéancier</h2>
        <div className="flex gap-2">
          {ECHEANCE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                tab === t.key
                  ? "bg-primary text-white"
                  : "border border-border text-text-secondary hover:text-text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-medium">Lot</th>
              <th className="px-4 py-3 font-medium">Copropriétaire</th>
              <th className="px-4 py-3 font-medium">Mois</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Montant reçu</th>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <EcheanceTableRow key={e.id} echeance={e} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                  Aucune échéance. L&apos;échéancier se génère automatiquement à l&apos;assignation d&apos;un
                  occupant avec un montant forfaitaire.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Dépense ----------

function DepenseModal({ residenceId, onClose }: { residenceId: string; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    montant: "",
    libelle: "",
    categorie: DEPENSE_CATEGORIES[0],
    pieceJointeUrl: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/ecritures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residenceId,
          type: "DEPENSE",
          date: form.date,
          montant: Number(form.montant),
          libelle: form.libelle,
          categorie: form.categorie,
          pieceJointeUrl: form.pieceJointeUrl || undefined,
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
    <Modal title="Dépense de la copropriété" onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-text-secondary">
          Règlement d&apos;une facture, prestation ou charge collective (fuite d&apos;eau, plombier,
          assurance...).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Montant (MAD)</label>
            <input
              required
              type="number"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Libellé</label>
          <input
            required
            placeholder="Ex: Plombier — réparation fuite couloir RDC"
            value={form.libelle}
            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Catégorie</label>
          <select
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            className={inputClass}
          >
            {DEPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Pièce justificative (optionnel)</label>
          <input
            placeholder="Ex: FAC-2026-042"
            value={form.pieceJointeUrl}
            onChange={(e) => setForm({ ...form, pieceJointeUrl: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="text-sm text-text-secondary hover:underline">
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-[var(--radius-button)] bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Enregistrement..." : "Enregistrer la dépense"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- Saisie libre (recette/dépense générique, existant) ----------

function SaisieLibreForm({ residenceId }: { residenceId: string }) {
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
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary hover:underline"
      >
        <Plus size={14} /> Saisie libre
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
  echeances,
}: {
  residenceId: string;
  ecritures: EcritureRow[];
  echeances: EcheanceRow[];
}) {
  const [depenseModalOpen, setDepenseModalOpen] = useState(false);

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

  const { soldeTresorerie, totalEmis, encaisse, enAttente } = useMemo(() => {
    const recettes = ecritures.filter((e) => e.type === "RECETTE").reduce((s, e) => s + e.montant, 0);
    const depenses = ecritures.filter((e) => e.type === "DEPENSE").reduce((s, e) => s + e.montant, 0);
    return {
      soldeTresorerie: recettes - depenses,
      totalEmis: echeances.reduce((s, e) => s + e.montant, 0),
      encaisse: echeances.filter((e) => e.statut === "PAYE").reduce((s, e) => s + (e.montantRecu ?? e.montant), 0),
      enAttente: echeances.filter((e) => e.statut !== "PAYE").reduce((s, e) => s + e.montant, 0),
    };
  }, [ecritures, echeances]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Comptabilité</h2>
        <div className="flex items-center gap-4">
          <SaisieLibreForm residenceId={residenceId} />
          <button
            onClick={() => setDepenseModalOpen(true)}
            className="rounded-[var(--radius-button)] bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Dépense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Solde trésorerie" value={`${soldeTresorerie.toLocaleString("fr-MA")} MAD`} color="primary" />
        <KpiCard label="Échéances émises" value={`${totalEmis.toLocaleString("fr-MA")} MAD`} color="secondary" />
        <KpiCard label="Encaissé" value={`${encaisse.toLocaleString("fr-MA")} MAD`} color="success" />
        <KpiCard label="En attente / retard" value={`${enAttente.toLocaleString("fr-MA")} MAD`} color="danger" />
      </div>

      <EcheancierSection echeances={echeances} />

      <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
        <h2 className="font-medium text-text-primary">Écritures comptables</h2>

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

      {depenseModalOpen && <DepenseModal residenceId={residenceId} onClose={() => setDepenseModalOpen(false)} />}
    </div>
  );
}
