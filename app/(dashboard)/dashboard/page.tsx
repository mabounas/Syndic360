import { redirect } from "next/navigation";
import { Building2, DoorOpen, AlertTriangle, Wallet } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/ui/KpiCard";
import { ResidenceCard } from "@/components/ui/ResidenceCard";

export default async function DashboardPage() {
  const session = await requireSession();

  if (!isStaffRole(session.role)) {
    redirect("/mes-charges");
  }

  const where = residenceScopeWhere(session);

  const residences = await prisma.residence.findMany({
    where,
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, ville: true, nbLots: true },
  });

  const [lotsCount, impayesCount] = await Promise.all([
    prisma.lot.count({ where: { batiment: { residence: where } } }),
    prisma.quotePart.count({
      where: {
        statut: "EN_RETARD",
        lot: { batiment: { residence: where } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Header title="Tableau de bord" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Résidences gérées" value={residences.length} icon={Building2} />
        <KpiCard label="Lots" value={lotsCount} icon={DoorOpen} color="secondary" />
        <KpiCard
          label="Quotes-parts en retard"
          value={impayesCount}
          icon={AlertTriangle}
          color="danger"
        />
        <KpiCard label="Plan" value={session.role === "SUPER_ADMIN" ? "Toutes organisations" : "—"} icon={Wallet} color="success" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-text-secondary">Résidences</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {residences.map((residence) => (
            <ResidenceCard key={residence.id} residence={residence} />
          ))}
          {residences.length === 0 && (
            <p className="text-sm text-text-secondary">
              Aucune résidence pour le moment.{" "}
              <a href="/residences" className="text-primary hover:underline">
                En ajouter une
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
