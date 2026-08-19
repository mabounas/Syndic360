"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import type { TicketRow } from "./types";

const URGENCE_CONFIG: Record<TicketRow["urgence"], { label: string; className: string }> = {
  BASSE: { label: "Basse", className: "bg-success/10 text-success" },
  MOYENNE: { label: "Moyenne", className: "bg-warning/10 text-warning" },
  HAUTE: { label: "Haute", className: "bg-danger/10 text-danger" },
};

const STATUT_CONFIG: Record<TicketRow["statut"], { label: string; className: string }> = {
  OUVERT: { label: "Ouvert", className: "bg-danger/10 text-danger" },
  EN_COURS: { label: "En cours", className: "bg-warning/10 text-warning" },
  RESOLU: { label: "Résolu", className: "bg-success/10 text-success" },
};

const TABS = [
  { key: "TOUS", label: "Tous" },
  { key: "OUVERT", label: "Ouverts" },
  { key: "EN_COURS", label: "En cours" },
  { key: "RESOLU", label: "Résolus" },
] as const;

const inputClass =
  "w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-text-secondary";

function NewTicketModal({ residenceId, onClose }: { residenceId: string; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    localisation: "",
    urgence: "MOYENNE" as TicketRow["urgence"],
    signalePar: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, residenceId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Erreur lors de la création du ticket.");
        return;
      }
      router.refresh();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal title="Nouveau ticket technique" onClose={onClose} maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Titre</label>
          <input
            required
            placeholder="Ex: Fuite robinet couloir 2ème étage"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            required
            rows={4}
            placeholder="Décrivez le problème en détail..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Localisation</label>
          <input
            required
            placeholder="Ex: Couloir 2ème étage, cage B"
            value={form.localisation}
            onChange={(e) => setForm({ ...form, localisation: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Urgence</label>
            <select
              value={form.urgence}
              onChange={(e) => setForm({ ...form, urgence: e.target.value as TicketRow["urgence"] })}
              className={inputClass}
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Signalé par</label>
            <input
              placeholder="Ex: M. Martin (Lot 7)"
              value={form.signalePar}
              onChange={(e) => setForm({ ...form, signalePar: e.target.value })}
              className={inputClass}
            />
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
            {pending ? "Création..." : "Créer le ticket"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TicketActions({ ticket }: { ticket: TicketRow }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatut(statut: TicketRow["statut"]) {
    setPending(true);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex gap-3 text-xs">
      {ticket.statut === "OUVERT" && (
        <button disabled={pending} onClick={() => setStatut("EN_COURS")} className="font-medium text-warning hover:underline disabled:opacity-50">
          Démarrer
        </button>
      )}
      {ticket.statut !== "RESOLU" && (
        <button disabled={pending} onClick={() => setStatut("RESOLU")} className="font-medium text-success hover:underline disabled:opacity-50">
          Résoudre
        </button>
      )}
      {ticket.statut === "RESOLU" && (
        <button disabled={pending} onClick={() => setStatut("OUVERT")} className="text-text-secondary hover:underline disabled:opacity-50">
          Rouvrir
        </button>
      )}
    </div>
  );
}

export function TicketsSection({ residenceId, tickets }: { residenceId: string; tickets: TicketRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("TOUS");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = tab === "TOUS" ? tickets : tickets.filter((t) => t.statut === tab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                tab === t.key
                  ? "bg-primary text-white"
                  : "border border-border text-text-secondary hover:text-text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus size={14} /> Nouveau ticket
        </button>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-medium">Urgence</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Localisation</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Signalé par</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", URGENCE_CONFIG[ticket.urgence].className)}>
                    {URGENCE_CONFIG[ticket.urgence].label}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">{ticket.titre}</td>
                <td className="px-4 py-3 text-text-secondary">{ticket.localisation}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", STATUT_CONFIG[ticket.statut].className)}>
                    {STATUT_CONFIG[ticket.statut].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{ticket.signalePar ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <TicketActions ticket={ticket} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-secondary">
                  <Wrench size={22} className="mx-auto mb-2 opacity-40" />
                  Aucun ticket.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && <NewTicketModal residenceId={residenceId} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
