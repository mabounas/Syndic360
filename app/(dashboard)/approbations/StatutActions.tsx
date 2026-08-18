"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StatutActions({ userId, statut }: { userId: string; statut: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatut(next: "APPROUVE" | "REJETE" | "BLOQUE") {
    setPending(true);
    await fetch(`/api/super-admin/users/${userId}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex gap-3 text-sm">
      {statut !== "APPROUVE" && (
        <button disabled={pending} onClick={() => setStatut("APPROUVE")} className="font-medium text-success hover:underline disabled:opacity-50">
          Approuver
        </button>
      )}
      {statut !== "REJETE" && (
        <button disabled={pending} onClick={() => setStatut("REJETE")} className="text-danger hover:underline disabled:opacity-50">
          Rejeter
        </button>
      )}
      {statut === "APPROUVE" && (
        <button disabled={pending} onClick={() => setStatut("BLOQUE")} className="text-warning hover:underline disabled:opacity-50">
          Bloquer
        </button>
      )}
    </div>
  );
}
