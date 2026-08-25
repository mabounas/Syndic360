import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

const MOIS_GENERES = 12;

// Génère l'échéancier mensuel d'un lot à partir de son montant forfaitaire,
// du mois courant jusqu'à 11 mois plus tard. Appelé à l'assignation d'un
// occupant. Sans effet si le lot n'a pas de montant forfaitaire, ou si des
// échéances existent déjà pour ce lot (indivision : plusieurs occupants
// sur le même lot ne dupliquent pas l'échéancier).
export async function genererEcheancier(lotId: string) {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: { montantForfaitaire: true },
  });
  if (!lot?.montantForfaitaire) return;

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const data = Array.from({ length: MOIS_GENERES }, (_, i) => ({
    lotId,
    mois: new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1),
    montant: lot.montantForfaitaire!,
  }));

  await prisma.echeance.createMany({ data, skipDuplicates: true });
}

// Bascule automatiquement EN_COURS -> NON_PAYE pour toute échéance dont le
// mois est arrivé (mois courant ou passé) et qui n'a pas été marquée payée.
// Appelé au chargement des pages Comptabilité/Finances/Tableau de bord (pas
// de cron en environnement serverless — auto-guérison à la lecture).
// Accepte soit un id de résidence unique, soit la clause `where` de
// residenceScopeWhere() pour couvrir toutes les résidences visibles.
export async function actualiserEcheancesEchues(
  residence: string | Prisma.ResidenceWhereInput
) {
  const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const residenceWhere: Prisma.ResidenceWhereInput =
    typeof residence === "string" ? { id: residence } : residence;

  await prisma.echeance.updateMany({
    where: {
      statut: "EN_COURS",
      mois: { lte: startOfCurrentMonth },
      lot: { batiment: { residence: residenceWhere } },
    },
    data: { statut: "NON_PAYE" },
  });
}
