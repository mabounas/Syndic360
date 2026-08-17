"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function DocumentUpload({
  onUpload,
  accept,
  maxSize = 50 * 1024 * 1024,
}: {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > maxSize) {
      setError(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)} Mo).`);
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError("Échec de l'envoi du document.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border-2 border-dashed p-8 text-center transition",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <Upload size={24} className="mb-2 text-text-secondary" />
        <p className="text-sm text-text-secondary">
          {uploading
            ? "Envoi en cours..."
            : "Glissez un fichier ici ou cliquez pour sélectionner"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
