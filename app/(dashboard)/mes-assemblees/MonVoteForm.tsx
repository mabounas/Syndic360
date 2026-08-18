"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type MyLot = { id: string; numero: string };
type ExistingVote = { lotId: string; valeur: "POUR" | "CONTRE" | "ABSTENTION" };

const OPTIONS: { value: ExistingVote["valeur"]; label: string; activeClass: string }[] = [
  { value: "POUR", label: "Pour", activeClass: "bg-success text-white" },
  { value: "CONTRE", label: "Contre", activeClass: "bg-danger text-white" },
  { value: "ABSTENTION", label: "Abstention", activeClass: "bg-text-secondary text-white" },
];

export function MonVoteForm({
  resolutionId,
  myLots,
  existingVotes,
  disabled,
}: {
  resolutionId: string;
  myLots: MyLot[];
  existingVotes: ExistingVote[];
  disabled: boolean;
}) {
  const router = useRouter();
  const [pendingLotId, setPendingLotId] = useState<string | null>(null);

  async function vote(lotId: string, valeur: ExistingVote["valeur"]) {
    setPendingLotId(lotId);
    await fetch(`/api/resolutions/${resolutionId}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lotId, valeur }),
    });
    setPendingLotId(null);
    router.refresh();
  }

  return (
    <div className="mt-2 space-y-1">
      {myLots.map((lot) => {
        const current = existingVotes.find((v) => v.lotId === lot.id)?.valeur;
        return (
          <div key={lot.id} className="flex items-center gap-2 text-sm">
            <span className="w-16 text-text-secondary">Lot {lot.numero}</span>
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                disabled={disabled || pendingLotId === lot.id}
                onClick={() => vote(lot.id, opt.value)}
                className={cn(
                  "rounded-[var(--radius-button)] border border-border px-2 py-1 text-xs disabled:opacity-50",
                  current === opt.value ? opt.activeClass : "bg-bg-card text-text-primary hover:bg-bg-page"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
