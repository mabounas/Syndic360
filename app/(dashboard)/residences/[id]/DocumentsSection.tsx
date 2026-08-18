"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { FileText, Trash2 } from "lucide-react";
import { DocumentUpload } from "@/components/ui/DocumentUpload";
import type { DocumentRow, LotOption } from "./types";

const DOSSIERS = [
  { value: "REGLEMENT", label: "Règlement de copropriété" },
  { value: "PV_AG", label: "PV d'AG" },
  { value: "CONTRATS", label: "Contrats" },
  { value: "BUDGETS", label: "Budgets" },
  { value: "DIVERS", label: "Divers" },
] as const;

export function DocumentsSection({
  residenceId,
  documents,
  lots,
}: {
  residenceId: string;
  documents: DocumentRow[];
  lots: LotOption[];
}) {
  const router = useRouter();
  const [dossier, setDossier] = useState<(typeof DOSSIERS)[number]["value"]>("DIVERS");
  const [visibilite, setVisibilite] = useState<"COMMUN" | "PRIVE">("COMMUN");
  const [lotId, setLotId] = useState<string>("");

  async function handleUpload(file: File) {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/documents/upload-url",
    });

    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residenceId,
        lotId: visibilite === "PRIVE" && lotId ? lotId : undefined,
        nom: file.name,
        type: file.type || "application/octet-stream",
        url: blob.url,
        taille: file.size,
        dossier,
        visibilite,
      }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <h2 className="font-medium text-text-primary">Documents (GED)</h2>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={dossier}
          onChange={(e) => setDossier(e.target.value as typeof dossier)}
          className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
        >
          {DOSSIERS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          value={visibilite}
          onChange={(e) => setVisibilite(e.target.value as typeof visibilite)}
          className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
        >
          <option value="COMMUN">Visible par tous les copropriétaires</option>
          <option value="PRIVE">Privé — lié à un lot</option>
        </select>
        {visibilite === "PRIVE" && (
          <select
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="">Sélectionner un lot</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.numero}
              </option>
            ))}
          </select>
        )}
      </div>

      <DocumentUpload onUpload={handleUpload} />

      <div className="divide-y divide-border">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between py-2">
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-text-primary hover:text-primary"
            >
              <FileText size={16} className="text-text-secondary" />
              {doc.nom}
              <span className="text-text-secondary">
                · {DOSSIERS.find((d) => d.value === doc.dossier)?.label}
                {doc.visibilite === "PRIVE" ? " · privé" : ""}
              </span>
            </a>
            <button onClick={() => handleDelete(doc.id)} aria-label="Supprimer">
              <Trash2 size={16} className="text-text-secondary hover:text-danger" />
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="py-2 text-sm text-text-secondary">Aucun document.</p>
        )}
      </div>
    </div>
  );
}
