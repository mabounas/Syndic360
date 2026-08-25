import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

// Génère l'échéancier mensuel d'un lot à partir de son montant forfaitaire,
// du mois courant jusqu'à décembre de l'année en cours (pas d'anticipation
// sur l'année suivante). Déclenché explicitement — au premier paiement d'un
// lot, après confirmation de l'utilisateur — jamais automatiquement en
// arrière-plan. Sans effet si le lot n'a pas de montant forfaitaire ; les
// mois déjà existants ne sont pas dupliqués (indivision, relances).
export async function genererEcheancier(lotId: string) {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: { montantForfaitaire: true },
  });
  if (!lot?.montantForfaitaire) return;

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const moisRestants = 12 - now.getMonth(); // mois courant -> décembre inclus
  const data = Array.from({ length: moisRestants }, (_, i) => ({
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
