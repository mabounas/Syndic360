"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activerCompteSchema, type ActiverCompteInput } from "@/lib/validation";

export function ActiverCompteForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
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
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="text-xl font-semibold text-text-primary">Activer mon compte</h1>
      <p className="text-sm text-text-secondary">
        Votre syndic a enregistré votre lot dans Syndic360. Saisissez vos informations telles
        qu&apos;il vous les a communiquées pour activer votre accès.
      </p>

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

      <p className="text-center text-sm text-text-secondary">
        Déjà activé ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
