"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { activerCompteSchema, type ActiverCompteInput } from "@/lib/validation";

export function ProprietaireRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [matchedResidences, setMatchedResidences] = useState<string[] | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActiverCompteInput>({ resolver: zodResolver(activerCompteSchema) });

  async function onSubmit(data: ActiverCompteInput) {
    setServerError(null);
    const res = await fetch("/api/auth/activer-compte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error ?? "Une erreur est survenue.");
      return;
    }
    const body = await res.json();
    setMatchedResidences(body.residences ?? []);
  }

  if (matchedResidences) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 size={40} className="mx-auto text-success" />
        <h2 className="text-lg font-semibold text-text-primary">Compte activé</h2>
        <p className="text-sm text-text-secondary">
          {matchedResidences.length > 0 ? (
            <>
              Vous avez été rattaché à :{" "}
              <span className="font-medium text-text-primary">{matchedResidences.join(", ")}</span>.
            </>
          ) : (
            "Votre compte a été activé."
          )}{" "}
          L&apos;administrateur de votre résidence doit maintenant approuver votre accès.
        </p>
        <button
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          className="w-full rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          Accéder à mon espace
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-text-secondary">
        Votre syndic a enregistré votre lot dans Syndic360. Saisissez vos informations telles
        qu&apos;il vous les a communiquées : nous vous rattachons automatiquement à votre lot et à
        votre résidence.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-text-secondary">Prénom</label>
          <input
            className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            {...register("prenom")}
          />
          {errors.prenom && <p className="mt-1 text-sm text-danger">{errors.prenom.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-secondary">Nom</label>
          <input
            className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            {...register("nom")}
          />
          {errors.nom && <p className="mt-1 text-sm text-danger">{errors.nom.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">Téléphone (optionnel)</label>
        <input
          type="tel"
          autoComplete="tel"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("telephone")}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">Email</label>
        <input
          type="email"
          autoComplete="email"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">Choisissez un mot de passe</label>
        <input
          type="password"
          autoComplete="new-password"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {isSubmitting ? "Activation..." : "Activer mon compte"}
      </button>
    </form>
  );
}
