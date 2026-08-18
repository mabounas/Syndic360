import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, ownedLotIds } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";

export default async function MesDocumentsPage() {
  const session = await requireSession();
  if (isStaffRole(session.role)) redirect("/dashboard");

  const lotIds = await ownedLotIds(session);
  const lots = await prisma.lot.findMany({
    where: { id: { in: lotIds } },
    select: { id: true, batiment: { select: { residenceId: true } } },
  });
  const residenceIds = [...new Set(lots.map((l) => l.batiment.residenceId))];

  const documents = await prisma.document.findMany({
    where: {
      residenceId: { in: residenceIds },
      OR: [{ visibilite: "COMMUN" }, { visibilite: "PRIVE", lotId: { in: lotIds } }],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Header title="Mes documents" />
      <div className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-bg-card p-2">
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-3 text-sm text-text-primary hover:text-primary"
          >
            <FileText size={16} className="text-text-secondary" />
            {doc.nom}
            {doc.visibilite === "PRIVE" && (
              <span className="text-text-secondary">· privé</span>
            )}
          </a>
        ))}
        {documents.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-text-secondary">
            Aucun document disponible.
          </p>
        )}
      </div>
    </div>
  );
}
