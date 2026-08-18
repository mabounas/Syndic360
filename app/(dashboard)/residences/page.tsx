import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { ResidenceCard } from "@/components/ui/ResidenceCard";
import { NewResidenceForm } from "./NewResidenceForm";

export default async function ResidencesPage() {
  const session = await requireSession();
  if (!isStaffRole(session.role)) redirect("/mes-charges");
  const canCreate = ["SUPER_ADMIN", "SYNDIC_ADMIN"].includes(session.role);

  const residences = await prisma.residence.findMany({
    where: residenceScopeWhere(session),
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, ville: true, nbLots: true },
  });

  return (
    <div className="space-y-6">
      <Header title="Résidences" />

      {canCreate && <NewResidenceForm />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {residences.map((residence) => (
          <ResidenceCard key={residence.id} residence={residence} />
        ))}
      </div>
    </div>
  );
}
