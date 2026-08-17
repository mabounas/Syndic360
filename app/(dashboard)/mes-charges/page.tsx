import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, ownedLotIds } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { ChargesTable } from "@/components/ui/ChargesTable";

export default async function MesChargesPage() {
  const session = await requireSession();
  if (isStaffRole(session.role)) redirect("/");

  const lotIds = await ownedLotIds(session);

  const quoteParts = await prisma.quotePart.findMany({
    where: { lotId: { in: lotIds } },
    include: { lot: true, appelCharges: true },
    orderBy: { appelCharges: { dateEcheance: "desc" } },
  });

  const rows = quoteParts.map((qp) => ({
    id: qp.id,
    lotNumero: qp.lot.numero,
    periode: qp.appelCharges.periode,
    montant: qp.montant,
    statut: qp.statut,
    datePaiement: qp.datePaiement ? qp.datePaiement.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <Header title="Mes charges" />
      <ChargesTable rows={rows} />
    </div>
  );
}
