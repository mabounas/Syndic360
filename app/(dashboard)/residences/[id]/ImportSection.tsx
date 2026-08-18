"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";

type ImportResult = {
  lotsCreated: number;
  proprietairesLinked: number;
  usersCreated: { email: string }[];
  errors: { line: number; message: string }[];
};

export function ImportSection({ residenceId }: { residenceId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/residences/${residenceId}/import`, {
      method: "POST",
      body: formData,
    });
    const body = await res.json().catch(() => null);
    setPending(false);

    if (!res.ok) {
      setError(body?.error ?? "Échec de l'import.");
      return;
    }
    setResult(body as ImportResult);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-text-primary">
          Import Excel (lots &amp; copropriétaires)
        </h2>
        <a
          href={`/api/residences/${residenceId}/import/template`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Download size={14} /> Télécharger le modèle
        </a>
      </div>

      <p className="text-sm text-text-secondary">
        Remplissez le modèle (une ligne par lot) puis importez-le. Les bâtiments sont créés
        automatiquement s&apos;ils n&apos;existent pas encore ; un compte copropriétaire est créé
        pour chaque email non reconnu — chaque résident active ensuite lui-même son compte via{" "}
        <span className="font-medium">/register</span> (choix « Copropriétaire »).
      </p>

      <label
        className={`flex cursor-pointer items-center gap-2 rounded-[var(--radius-button)] border border-dashed border-border px-4 py-3 text-sm text-text-secondary hover:border-primary ${
          pending ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <Upload size={16} />
        {pending ? "Import en cours..." : "Choisir un fichier .xlsx à importer"}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      {result && (
        <div className="space-y-2 rounded-[var(--radius-button)] bg-bg-page p-3 text-sm">
          <p className="text-text-primary">
            <span className="font-medium text-success">{result.lotsCreated}</span> lot(s) créé(s) ·{" "}
            <span className="font-medium text-success">{result.proprietairesLinked}</span> copropriétaire(s) lié(s)
            {result.errors.length > 0 && (
              <>
                {" "}
                · <span className="font-medium text-danger">{result.errors.length}</span> erreur(s)
              </>
            )}
          </p>

          {result.usersCreated.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-text-primary">
                Nouveaux comptes créés (à activer par chacun via /register — Copropriétaire) :
              </p>
              <ul className="list-inside list-disc text-text-secondary">
                {result.usersCreated.map((u) => (
                  <li key={u.email}>{u.email}</li>
                ))}
              </ul>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-danger">Lignes en erreur :</p>
              <ul className="list-inside list-disc text-text-secondary">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Ligne {e.line} : {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
