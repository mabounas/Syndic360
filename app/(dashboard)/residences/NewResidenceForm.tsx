"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { residenceSchema, type ResidenceInput } from "@/lib/validation";

export function NewResidenceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResidenceInput>({ resolver: zodResolver(residenceSchema) });

  async function onSubmit(data: ResidenceInput) {
    setServerError(null);
    const res = await fetch("/api/residences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error ?? "Erreur lors de la création.");
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        <Plus size={16} />
        Nouvelle résidence
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 rounded-[var(--radius-card)] border border-border bg-bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary">Nouvelle résidence</h3>
        <button type="button" onClick={() => setOpen(false)}>
          <X size={18} className="text-text-secondary" />
        </button>
      </div>

      <div>
        <input
          placeholder="Nom de la résidence"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("nom")}
        />
        {errors.nom && <p className="mt-1 text-sm text-danger">{errors.nom.message}</p>}
      </div>
      <div>
        <input
          placeholder="Adresse"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("adresse")}
        />
        {errors.adresse && <p className="mt-1 text-sm text-danger">{errors.adresse.message}</p>}
      </div>
      <div>
        <input
          placeholder="Ville"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("ville")}
        />
        {errors.ville && <p className="mt-1 text-sm text-danger">{errors.ville.message}</p>}
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {isSubmitting ? "Création..." : "Créer"}
      </button>
    </form>
  );
}
