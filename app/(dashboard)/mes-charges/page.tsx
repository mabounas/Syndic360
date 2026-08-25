import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, ownedLotIds } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { ChargesTable } from "@/components/ui/ChargesTable";

const ECHEANCE_STATUT_TO_CHARGE_STATUT = {
  EN_COURS: "EN_ATTENTE",
  NON_PAYE: "EN_RETARD",
  PAYE: "PAYE",
} as const;

export default async function MesChargesPage() {
  const session = await requireSession();
  if (isStaffRole(session.role)) redirect("/dashboard");

  const lotIds = await ownedLotIds(session);

  const [quoteParts, echeances] = await Promise.all([
    prisma.quotePart.findMany({
      where: { lotId: { in: lotIds } },
      include: { lot: true, appelCharges: true },
      orderBy: { appelCharges: { dateEcheance: "desc" } },
    }),
    prisma.echeance.findMany({
      where: { lotId: { in: lotIds } },
      include: { lot: true },
      orderBy: { mois: "desc" },
    }),
  ]);

  const quotePartRows = quoteParts.map((qp) => ({
    id: qp.id,
    lotNumero: qp.lot.numero,
    periode: qp.appelCharges.periode,
    montant: qp.montant,
    statut: qp.statut,
    datePaiement: qp.datePaiement ? qp.datePaiement.toISOString() : null,
    sortDate: qp.appelCharges.dateEcheance,
  }));

  const echeanceRows = echeances.map((e) => ({
    id: `ech-${e.id}`,
    lotNumero: e.lot.numero,
    periode: e.mois.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    montant: e.montant,
    statut: ECHEANCE_STATUT_TO_CHARGE_STATUT[e.statut],
    datePaiement: e.datePaiement ? e.datePaiement.toISOString() : null,
    sortDate: e.mois,
  }));

  const rows = [...quotePartRows, ...echeanceRows]
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .map(({ sortDate, ...row }) => row);

  return (
    <div className="space-y-6">
      <Header title="Mes charges" />
      <ChargesTable rows={rows} />
    </div>
  );
}
