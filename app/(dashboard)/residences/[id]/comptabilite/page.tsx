import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { residenceScopeWhere } from "@/lib/rbac";
import { actualiserEcheancesEchues } from "@/lib/echeancier";
import { ComptabiliteSection } from "../ComptabiliteSection";

export default async function ResidenceComptabilitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const residence = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    select: { id: true },
  });
  if (!residence) return null;

  await actualiserEcheancesEchues(residence.id);

  const [ecritures, lots, echeances] = await Promise.all([
    prisma.ecritureComptable.findMany({
      where: { residenceId: residence.id },
      orderBy: { date: "desc" },
    }),
    prisma.lot.findMany({
      where: { batiment: { residenceId: residence.id }, proprietaires: { some: {} } },
      orderBy: { numero: "asc" },
      select: {
        id: true,
        numero: true,
        proprietaires: { select: { user: { select: { nom: true, prenom: true } } } },
      },
    }),
    prisma.echeance.findMany({
      where: { lot: { batiment: { residenceId: residence.id } } },
      orderBy: [{ mois: "desc" }, { lot: { numero: "asc" } }],
      select: {
        id: true,
        mois: true,
        montant: true,
        statut: true,
        montantRecu: true,
        datePaiement: true,
        referencePaiement: true,
        lot: {
          select: {
            id: true,
            numero: true,
            proprietaires: { select: { user: { select: { nom: true, prenom: true } } } },
          },
        },
      },
    }),
  ]);

  return (
    <ComptabiliteSection residenceId={residence.id} ecritures={ecritures} lots={lots} echeances={echeances} />
  );
}
