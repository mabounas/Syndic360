"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validation";

export function SyndicRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { plan: "BENEVOLE" },
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-text-secondary">
        Pour un syndic professionnel (cabinet) ou bénévole (conseil syndical). Votre compte sera
        soumis à l&apos;approbation de l&apos;administrateur Syndic360 avant de pouvoir configurer
        votre résidence.
      </p>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">
          Nom de l&apos;organisation
        </label>
        <input
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Ex : Cabinet Al Amane, Conseil Syndical Les Palmiers..."
          {...register("organisationNom")}
        />
        {errors.organisationNom && (
          <p className="mt-1 text-sm text-danger">{errors.organisationNom.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-text-secondary">Prénom</label>
          <input
            className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            {...register("prenom")}
          />
          {errors.prenom && (
            <p className="mt-1 text-sm text-danger">{errors.prenom.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-secondary">Nom</label>
          <input
            className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            {...register("nom")}
          />
          {errors.nom && (
            <p className="mt-1 text-sm text-danger">{errors.nom.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">Email</label>
        <input
          type="email"
          autoComplete="email"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">Mot de passe</label>
        <input
          type="password"
          autoComplete="new-password"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">Type de compte</label>
        <select
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("plan")}
        >
          <option value="BENEVOLE">Syndic bénévole (20 Dhs/lot, 1 résidence)</option>
          <option value="PRO">Cabinet professionnel Pro (10 Dhs/lot, min. 500 lots)</option>
        </select>
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {isSubmitting ? "Création..." : "Créer mon compte syndic"}
      </button>
    </form>
  );
}
