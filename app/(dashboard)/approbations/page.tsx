import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatutActions } from "./StatutActions";
import { cn } from "@/lib/utils";

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "En attente", className: "bg-warning/10 text-warning" },
  APPROUVE: { label: "Approuvé", className: "bg-success/10 text-success" },
  REJETE: { label: "Rejeté", className: "bg-danger/10 text-danger" },
  BLOQUE: { label: "Désactivé", className: "bg-danger/10 text-danger" },
};

export default async function ApprobationsPage() {
  const session = await requireSession();
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");

  const admins = await prisma.user.findMany({
    where: { role: "SYNDIC_ADMIN" },
    include: { organisation: true },
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <Header title="Approbations" />
      <p className="-mt-4 text-sm text-text-secondary">
        Comptes administrateur d&apos;organisation (syndics professionnels &amp; bénévoles).
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-medium">Organisation</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-text-primary">{admin.organisation.nom}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {admin.prenom} {admin.nom} · {admin.email}
                </td>
                <td className="px-4 py-3 text-text-secondary">{admin.organisation.plan}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      STATUT_CONFIG[admin.statut]?.className
                    )}
                  >
                    {STATUT_CONFIG[admin.statut]?.label ?? admin.statut}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatutActions userId={admin.id} statut={admin.statut} />
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                  Aucun compte pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
