"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MessageActions({ id, statut }: { id: string; statut: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatut(next: "NOUVEAU" | "TRAITE") {
    setPending(true);
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="text-sm">
      {statut === "NOUVEAU" ? (
        <button disabled={pending} onClick={() => setStatut("TRAITE")} className="font-medium text-success hover:underline disabled:opacity-50">
          Marquer comme traité
        </button>
      ) : (
        <button disabled={pending} onClick={() => setStatut("NOUVEAU")} className="text-text-secondary hover:underline disabled:opacity-50">
          Marquer comme nouveau
        </button>
      )}
    </div>
  );
}
