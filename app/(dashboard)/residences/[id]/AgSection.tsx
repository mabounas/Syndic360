"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { AgRow, LotWithOwners, ResolutionRow } from "./types";

const MAJORITE_LABELS: Record<ResolutionRow["typeMajorite"], string> = {
  ART24: "Art. 24 — majorité simple",
  ART25: "Art. 25 — majorité absolue",
  ART26: "Art. 26 — double majorité",
};

const STATUT_LABELS: Record<AgRow["statut"], string> = {
  PLANIFIEE: "Planifiée",
  CONVOQUEE: "Vote ouvert",
  CLOTUREE: "Clôturée",
};

function computeResultat(resolution: ResolutionRow, lots: LotWithOwners[]) {
  const tantiemesParLot = new Map(lots.map((l) => [l.id, l.tantiemesGeneraux]));
  const totalTantiemes = lots.reduce((s, l) => s + l.tantiemesGeneraux, 0);
  let pour = 0;
  let contre = 0;
  let abstention = 0;
  for (const vote of resolution.votes) {
    const poids = tantiemesParLot.get(vote.lotId) ?? 0;
    if (vote.valeur === "POUR") pour += poids;
    else if (vote.valeur === "CONTRE") contre += poids;
    else abstention += poids;
  }
  let adopte: boolean;
  if (resolution.typeMajorite === "ART24") adopte = pour > contre;
  else if (resolution.typeMajorite === "ART25") adopte = pour > totalTantiemes / 2;
  else adopte = pour >= (totalTantiemes * 2) / 3;
  return { pour, contre, abstention, totalTantiemes, adopte };
}

function NewAgForm({ residenceId }: { residenceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ date: "", lieu: "", type: "ORDINAIRE" as "ORDINAIRE" | "EXTRAORDINAIRE" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await fetch("/api/assemblees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residenceId, ...form }),
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
        <Plus size={14} /> Planifier une AG
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <input
        required
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        required
        placeholder="Lieu (ou lien visio)"
        value={form.lieu}
        onChange={(e) => setForm({ ...form, lieu: e.target.value })}
        className="w-56 rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      >
        <option value="ORDINAIRE">Ordinaire</option>
        <option value="EXTRAORDINAIRE">Extraordinaire</option>
      </select>
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
    </form>
  );
}

function NewResolutionForm({ agId }: { agId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", typeMajorite: "ART24" as ResolutionRow["typeMajorite"] });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await fetch(`/api/assemblees/${agId}/resolutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
        <Plus size={12} /> Ajouter une résolution
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-2 rounded-[var(--radius-button)] bg-bg-page p-3">
      <input
        required
        placeholder="Titre de la résolution"
        value={form.titre}
        onChange={(e) => setForm({ ...form, titre: e.target.value })}
        className="w-full rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <textarea
        required
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="w-full rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <div className="flex items-center gap-2">
        <select
          value={form.typeMajorite}
          onChange={(e) => setForm({ ...form, typeMajorite: e.target.value as typeof form.typeMajorite })}
          className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
        >
          {Object.entries(MAJORITE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          Ajouter
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:underline">
          Annuler
        </button>
      </div>
    </form>
  );
}

function VoteForm({ resolutionId, lots }: { resolutionId: string; lots: LotWithOwners[] }) {
  const router = useRouter();
  const [lotId, setLotId] = useState("");
  const [pending, setPending] = useState(false);

  async function vote(valeur: "POUR" | "CONTRE" | "ABSTENTION") {
    if (!lotId) return;
    setPending(true);
    await fetch(`/api/resolutions/${resolutionId}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lotId, valeur }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="mt-2 flex items-center gap-2 text-sm">
      <select
        value={lotId}
        onChange={(e) => setLotId(e.target.value)}
        className="rounded-[var(--radius-button)] border border-border px-2 py-1 text-sm outline-none focus:border-primary"
      >
        <option value="">Voter pour le lot...</option>
        {lots.map((lot) => (
          <option key={lot.id} value={lot.id}>
            {lot.numero}
          </option>
        ))}
      </select>
      <button disabled={!lotId || pending} onClick={() => vote("POUR")} className="text-success hover:underline disabled:opacity-40">
        Pour
      </button>
      <button disabled={!lotId || pending} onClick={() => vote("CONTRE")} className="text-danger hover:underline disabled:opacity-40">
        Contre
      </button>
      <button disabled={!lotId || pending} onClick={() => vote("ABSTENTION")} className="text-text-secondary hover:underline disabled:opacity-40">
        Abstention
      </button>
    </div>
  );
}

function AgCard({ ag, lots }: { ag: AgRow; lots: LotWithOwners[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function transition(action: "convoquer" | "cloturer") {
    setPending(true);
    await fetch(`/api/assemblees/${ag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="rounded-[var(--radius-button)] border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">
          AG {ag.type === "ORDINAIRE" ? "ordinaire" : "extraordinaire"} du{" "}
          {new Date(ag.date).toLocaleDateString("fr-MA")}{" "}
          <span className="text-text-secondary">· {ag.lieu} · {STATUT_LABELS[ag.statut]}</span>
        </p>
        <div className="flex items-center gap-2">
          {ag.statut === "PLANIFIEE" && (
            <button
              onClick={() => transition("convoquer")}
              disabled={pending}
              className="text-sm text-primary hover:underline"
            >
              Envoyer convocation
            </button>
          )}
          {ag.statut === "CONVOQUEE" && (
            <button
              onClick={() => transition("cloturer")}
              disabled={pending}
              className="text-sm text-primary hover:underline"
            >
              Clôturer l&apos;AG
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {ag.resolutions.map((resolution) => {
          const resultat = computeResultat(resolution, lots);
          return (
            <div key={resolution.id} className="rounded-[var(--radius-button)] bg-bg-page p-3">
              <p className="text-sm font-medium text-text-primary">{resolution.titre}</p>
              <p className="text-sm text-text-secondary">{resolution.description}</p>
              <p className="mt-1 text-xs text-text-secondary">{MAJORITE_LABELS[resolution.typeMajorite]}</p>
              <p className="mt-1 text-sm">
                Pour : {resultat.pour} · Contre : {resultat.contre} · Abstention : {resultat.abstention} /{" "}
                {resultat.totalTantiemes} tantièmes —{" "}
                <span className={resultat.adopte ? "font-medium text-success" : "font-medium text-danger"}>
                  {resultat.adopte ? "Adoptée" : "Rejetée (à ce stade)"}
                </span>
              </p>
              {ag.statut !== "CLOTUREE" && <VoteForm resolutionId={resolution.id} lots={lots} />}
            </div>
          );
        })}
        {ag.statut !== "CLOTUREE" && <NewResolutionForm agId={ag.id} />}
      </div>
    </div>
  );
}

export function AgSection({
  residenceId,
  assemblees,
  lots,
}: {
  residenceId: string;
  assemblees: AgRow[];
  lots: LotWithOwners[];
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-text-primary">Assemblées générales</h2>
        <NewAgForm residenceId={residenceId} />
      </div>

      {assemblees.map((ag) => (
        <AgCard key={ag.id} ag={ag} lots={lots} />
      ))}
      {assemblees.length === 0 && (
        <p className="text-sm text-text-secondary">Aucune assemblée planifiée.</p>
      )}
    </div>
  );
}
