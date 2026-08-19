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

type LotFormState = {
  numero: string;
  type: (typeof LOT_TYPES)[number]["value"];
  etage: string;
  surface: string;
  tantiemesGeneraux: string;
  tantiemesCharges: string;
  montantForfaitaire: string;
};

const EMPTY_LOT_FORM: LotFormState = {
  numero: "",
  type: "APPARTEMENT",
  etage: "",
  surface: "",
  tantiemesGeneraux: "",
  tantiemesCharges: "",
  montantForfaitaire: "",
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-[var(--radius-card)] border border-border bg-bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-danger">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LotFormFields({
  form,
  setForm,
}: {
  form: LotFormState;
  setForm: (form: LotFormState) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
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
            onChange={(e) => setForm({ ...form, type: e.target.value as LotFormState["type"] })}
            className={inputClass}
          >
            {LOT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Étage</label>
          <input
            type="number"
            value={form.etage}
            onChange={(e) => setForm({ ...form, etage: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Surface (m²)</label>
          <input
            type="number"
            value={form.surface}
            onChange={(e) => setForm({ ...form, surface: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Tantièmes généraux</label>
          <input
            required
            type="number"
            value={form.tantiemesGeneraux}
            onChange={(e) => setForm({ ...form, tantiemesGeneraux: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Tantièmes charges</label>
          <input
            required
            type="number"
            value={form.tantiemesCharges}
            onChange={(e) => setForm({ ...form, tantiemesCharges: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Montant forfaitaire (MAD)</label>
          <input
            type="number"
            value={form.montantForfaitaire}
            onChange={(e) => setForm({ ...form, montantForfaitaire: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
    </>
  );
}

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

type OccupantFormState = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typeOccupant: "PROPRIETAIRE" | "LOCATAIRE";
};

const EMPTY_OCCUPANT_FORM: OccupantFormState = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  typeOccupant: "PROPRIETAIRE",
};

function NewLotModal({ batimentId, onClose }: { batimentId: string; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LotFormState>(EMPTY_LOT_FORM);
  const [occupant, setOccupant] = useState<OccupantFormState>(EMPTY_OCCUPANT_FORM);
  const [lotCreatedId, setLotCreatedId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const occupantFilled = occupant.nom.trim() || occupant.prenom.trim() || occupant.email.trim();
    const occupantValid = occupant.nom.trim() && occupant.prenom.trim() && occupant.email.trim();
    if (occupantFilled && !occupantValid) {
      setError("Prénom, nom et email sont requis pour assigner un occupant.");
      return;
    }

    setPending(true);
    try {
      let lotId = lotCreatedId;
      if (!lotId) {
        const res = await fetch("/api/lots", {
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
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.error ?? "Erreur lors de la création du lot.");
          return;
        }
        const lot = await res.json();
        lotId = lot.id;
        setLotCreatedId(lotId);
      }

      if (occupantValid) {
        const res2 = await fetch(`/api/lots/${lotId}/proprietaires`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(occupant),
        });
        if (!res2.ok) {
          const body = await res2.json().catch(() => null);
          setError(body?.error ?? "Le lot a été créé, mais l'assignation de l'occupant a échoué.");
          return;
        }
      }

      router.refresh();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal title="Ajouter un lot" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={!!lotCreatedId} className="space-y-4 disabled:opacity-50">
          <LotFormFields form={form} setForm={setForm} />
        </fieldset>
        {lotCreatedId && (
          <p className="text-xs text-success">Lot {form.numero} créé. Complétez l&apos;occupant ci-dessous.</p>
        )}

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
            Occupant (optionnel)
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Prénom</label>
                <input
                  value={occupant.prenom}
                  onChange={(e) => setOccupant({ ...occupant, prenom: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Nom</label>
                <input
                  value={occupant.nom}
                  onChange={(e) => setOccupant({ ...occupant, nom: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Statut</label>
                <select
                  value={occupant.typeOccupant}
                  onChange={(e) =>
                    setOccupant({ ...occupant, typeOccupant: e.target.value as OccupantFormState["typeOccupant"] })
                  }
                  className={inputClass}
                >
                  <option value="PROPRIETAIRE">Propriétaire</option>
                  <option value="LOCATAIRE">Locataire</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Email</label>
                <input
                  type="email"
                  value={occupant.email}
                  onChange={(e) => setOccupant({ ...occupant, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Téléphone</label>
                <input
                  value={occupant.telephone}
                  onChange={(e) => setOccupant({ ...occupant, telephone: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              La personne active elle-même son compte sur <span className="font-medium">/register</span> (choix
              « Copropriétaire »).
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="text-sm text-text-secondary hover:underline">
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {pending ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function NewLotForm({ batimentId }: { batimentId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus size={12} /> Lot
      </button>
      {open && <NewLotModal batimentId={batimentId} onClose={() => setOpen(false)} />}
    </>
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

function toEditState(lot: LotWithOwners): LotFormState {
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

type OccupantEditState = {
  userId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typeOccupant: "PROPRIETAIRE" | "LOCATAIRE";
};

function toOccupantEditState(lot: LotWithOwners): OccupantEditState[] {
  return lot.proprietaires.map((p) => ({
    userId: p.user.id,
    nom: p.user.nom,
    prenom: p.user.prenom,
    email: p.user.email,
    telephone: p.user.telephone ?? "",
    typeOccupant: p.typeOccupant,
  }));
}

function LotEditModal({ lot, onClose }: { lot: LotWithOwners; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LotFormState>(() => toEditState(lot));
  const [occupants, setOccupants] = useState<OccupantEditState[]>(() => toOccupantEditState(lot));

  function updateOccupant(userId: string, patch: Partial<OccupantEditState>) {
    setOccupants((prev) => prev.map((o) => (o.userId === userId ? { ...o, ...patch } : o)));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Erreur lors de l'enregistrement du lot.");
        return;
      }

      for (const occ of occupants) {
        const res2 = await fetch(`/api/lots/${lot.id}/proprietaires/${occ.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: occ.nom,
            prenom: occ.prenom,
            email: occ.email,
            telephone: occ.telephone,
            typeOccupant: occ.typeOccupant,
          }),
        });
        if (!res2.ok) {
          const body = await res2.json().catch(() => null);
          setError(body?.error ?? `Erreur lors de la mise à jour de ${occ.prenom} ${occ.nom}.`);
          return;
        }
      }

      router.refresh();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal title={`Modifier le lot ${lot.numero}`} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <LotFormFields form={form} setForm={setForm} />

        {occupants.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
              Occupant{occupants.length > 1 ? "s" : ""}
            </p>
            <div className="space-y-4">
              {occupants.map((occ) => (
                <div key={occ.userId} className="space-y-3 rounded-[var(--radius-button)] bg-bg-page p-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-secondary">Prénom</label>
                      <input
                        required
                        value={occ.prenom}
                        onChange={(e) => updateOccupant(occ.userId, { prenom: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-secondary">Nom</label>
                      <input
                        required
                        value={occ.nom}
                        onChange={(e) => updateOccupant(occ.userId, { nom: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-secondary">Statut</label>
                      <select
                        value={occ.typeOccupant}
                        onChange={(e) =>
                          updateOccupant(occ.userId, {
                            typeOccupant: e.target.value as OccupantEditState["typeOccupant"],
                          })
                        }
                        className={inputClass}
                      >
                        <option value="PROPRIETAIRE">Propriétaire</option>
                        <option value="LOCATAIRE">Locataire</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-secondary">Email</label>
                      <input
                        required
                        type="email"
                        value={occ.email}
                        onChange={(e) => updateOccupant(occ.userId, { email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-secondary">Téléphone</label>
                      <input
                        value={occ.telephone}
                        onChange={(e) => updateOccupant(occ.userId, { telephone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

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
                <div key={p.user.id} className="font-medium text-text-primary">
                  {p.user.prenom} {p.user.nom}
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
        <td className={cellClass}>
          {lot.proprietaires.length > 0 && (
            <div className="space-y-0.5">
              {lot.proprietaires.map((p) => (
                <div key={p.user.id} className="text-text-secondary">
                  {OCCUPANT_LABELS[p.typeOccupant]}
                </div>
              ))}
            </div>
          )}
        </td>
        <td className={cellClass}>
          {lot.proprietaires.length > 0 && (
            <div className="space-y-0.5">
              {lot.proprietaires.map((p) => (
                <div key={p.user.id} className="text-text-secondary">
                  {p.user.telephone ?? "—"}
                </div>
              ))}
            </div>
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
          <td colSpan={11} className="px-3 py-2.5">
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
            <th className={cellClass}>Statut</th>
            <th className={cellClass}>Téléphone</th>
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
