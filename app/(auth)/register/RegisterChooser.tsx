"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { SyndicRegisterForm } from "./SyndicRegisterForm";
import { ProprietaireRegisterForm } from "./ProprietaireRegisterForm";

type AccountType = "syndic" | "proprietaire";

export function RegisterChooser() {
  const [type, setType] = useState<AccountType>("syndic");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Créer mon compte</h1>
        <p className="mt-1 text-sm text-text-secondary">Je suis...</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-[var(--radius-button)] border border-border bg-bg-page p-1">
        <button
          type="button"
          onClick={() => setType("syndic")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-[calc(var(--radius-button)-2px)] px-3 py-2.5 text-sm font-semibold transition",
            type === "syndic" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary",
          )}
        >
          <Building2 size={16} />
          Syndic
        </button>
        <button
          type="button"
          onClick={() => setType("proprietaire")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-[calc(var(--radius-button)-2px)] px-3 py-2.5 text-sm font-semibold transition",
            type === "proprietaire" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary",
          )}
        >
          <UserRound size={16} />
          Copropriétaire
        </button>
      </div>

      {type === "syndic" ? <SyndicRegisterForm /> : <ProprietaireRegisterForm />}

      <p className="text-center text-sm text-text-secondary">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
