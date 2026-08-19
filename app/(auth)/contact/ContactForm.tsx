"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validation";

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    setServerError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error ?? "Une erreur est survenue.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 size={40} className="mx-auto text-success" />
        <h1 className="text-xl font-semibold text-text-primary">Message envoyé</h1>
        <p className="text-sm text-text-secondary">
          Merci, votre message a bien été transmis à l&apos;équipe Syndic360. Nous vous répondrons
          rapidement.
        </p>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="text-xl font-semibold text-text-primary">Nous contacter</h1>
      <p className="text-sm text-text-secondary">
        Une question, un problème avec votre compte ? Envoyez-nous un message, l&apos;équipe
        Syndic360 vous répond directement.
      </p>

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
        <label className="mb-1 block text-sm text-text-secondary">Sujet</label>
        <input
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("sujet")}
        />
        {errors.sujet && <p className="mt-1 text-sm text-danger">{errors.sujet.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">Message</label>
        <textarea
          rows={5}
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-sm text-danger">{errors.message.message}</p>}
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {isSubmitting ? "Envoi..." : "Envoyer le message"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        <Link href="/" className="text-primary hover:underline">
          Retour à l&apos;accueil
        </Link>
      </p>
    </form>
  );
}
