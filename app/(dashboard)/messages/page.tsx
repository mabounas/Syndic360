import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { MessageActions } from "./MessageActions";

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  NOUVEAU: { label: "Nouveau", className: "bg-secondary/10 text-secondary" },
  TRAITE: { label: "Traité", className: "bg-success/10 text-success" },
};

export default async function MessagesPage() {
  const session = await requireSession();
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");

  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <Header title="Messages" />
      <p className="-mt-4 text-sm text-text-secondary">
        Messages reçus via le formulaire de contact public.
      </p>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-text-primary">{msg.sujet}</span>{" "}
                <span
                  className={cn(
                    "ml-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    STATUT_CONFIG[msg.statut]?.className
                  )}
                >
                  {STATUT_CONFIG[msg.statut]?.label}
                </span>
              </div>
              <span className="text-xs text-text-secondary">
                {new Date(msg.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>
            <p className="mb-2 text-sm text-text-secondary">
              De <span className="font-medium text-text-primary">{msg.nom}</span> —{" "}
              <a href={`mailto:${msg.email}`} className="text-primary hover:underline">
                {msg.email}
              </a>
            </p>
            <p className="mb-3 whitespace-pre-wrap text-sm text-text-primary">{msg.message}</p>
            <MessageActions id={msg.id} statut={msg.statut} />
          </div>
        ))}
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-text-secondary">Aucun message pour le moment.</p>
        )}
      </div>
    </div>
  );
}
