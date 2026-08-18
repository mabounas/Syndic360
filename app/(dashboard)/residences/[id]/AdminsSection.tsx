"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus, UserPlus } from "lucide-react";

type StaffUser = { id: string; nom: string; prenom: string; email: string; role: string };

export function AdminsSection({
  residenceId,
  admins,
  candidates,
  canManage,
}: {
  residenceId: string;
  admins: StaffUser[];
  candidates: StaffUser[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [pending, setPending] = useState(false);

  const assignable = candidates.filter((c) => !admins.some((a) => a.id === c.id));

  async function assign() {
    if (!selected) return;
    setPending(true);
    await fetch(`/api/residences/${residenceId}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected }),
    });
    setPending(false);
    setSelected("");
    router.refresh();
  }

  async function unassign(userId: string) {
    setPending(true);
    await fetch(`/api/residences/${residenceId}/admins/${userId}`, { method: "DELETE" });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <h2 className="font-medium text-text-primary">Administrateurs de la résidence</h2>

      <ul className="divide-y divide-border">
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center justify-between py-2 text-sm">
            <span className="text-text-primary">
              {admin.prenom} {admin.nom}{" "}
              <span className="text-text-secondary">
                · {admin.email} · {admin.role === "GESTIONNAIRE" ? "Gestionnaire" : "Conseil bénévole"}
              </span>
            </span>
            {canManage && (
              <button
                onClick={() => unassign(admin.id)}
                disabled={pending}
                className="text-text-secondary hover:text-danger"
                aria-label="Retirer"
              >
                <UserMinus size={16} />
              </button>
            )}
          </li>
        ))}
        {admins.length === 0 && (
          <li className="py-2 text-sm text-danger">
            Aucun administrateur assigné — cette résidence n&apos;est visible que par les SyndicAdmin.
          </li>
        )}
      </ul>

      {canManage && assignable.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-[var(--radius-button)] border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="">Assigner un gestionnaire...</option>
            {assignable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.prenom} {c.nom} ({c.email})
              </option>
            ))}
          </select>
          <button
            onClick={assign}
            disabled={!selected || pending}
            className="flex items-center gap-1 rounded-[var(--radius-button)] bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            <UserPlus size={14} /> Assigner
          </button>
        </div>
      )}
    </div>
  );
}
