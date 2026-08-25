import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

// Génère l'échéancier mensuel d'un lot à partir de son montant forfaitaire,
// du mois de `referenceDate` (par défaut aujourd'hui) jusqu'à décembre de
// cette même année — pas d'anticipation sur l'année suivante. Déclenché
// explicitement, après confirmation de l'utilisateur — jamais automatiquement
// en arrière-plan. `referenceDate` permet de démarrer l'échéancier sur une
// année passée (ex : premier paiement saisi rétroactivement pour 2024).
// Sans effet si le lot n'a pas de montant forfaitaire ; les mois déjà
// existants ne sont pas dupliqués (indivision, relances).
export async function genererEcheancier(lotId: string, referenceDate: Date = new Date()) {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: { montantForfaitaire: true },
  });
  if (!lot?.montantForfaitaire) return;

  const startMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const moisRestants = 12 - referenceDate.getMonth(); // mois de référence -> décembre inclus
  const data = Array.from({ length: moisRestants }, (_, i) => ({
    lotId,
    mois: new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1),
    montant: lot.montantForfaitaire!,
  }));

  await prisma.echeance.createMany({ data, skipDuplicates: true });
}

// 1) Bascule automatiquement EN_COURS -> NON_PAYE pour toute échéance dont
// le mois est arrivé (mois courant ou passé) et qui n'a pas été marquée
// payée. 2) Garantit que tout lot occupé avec un montant forfaitaire a une
// échéance pour le mois courant, même s'il n'a jamais eu de paiement
// tenté — sans quoi ces lots restent invisibles dans les impayés
// (l'échéancier n'étant plus généré qu'au premier paiement). Ne touche
// jamais les mois futurs : ce n'est pas une génération en masse, juste le
// minimum pour que le mois en cours soit toujours suivi. Appelé au
// chargement des pages Comptabilité/Finances/Tableau de bord/Impayés (pas
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

  const lotsSansEcheanceCeMois = await prisma.lot.findMany({
    where: {
      batiment: { residence: residenceWhere },
      montantForfaitaire: { not: null },
      proprietaires: { some: {} },
      echeances: { none: { mois: startOfCurrentMonth } },
    },
    select: { id: true, montantForfaitaire: true },
  });

  if (lotsSansEcheanceCeMois.length > 0) {
    await prisma.echeance.createMany({
      data: lotsSansEcheanceCeMois.map((lot) => ({
        lotId: lot.id,
        mois: startOfCurrentMonth,
        montant: lot.montantForfaitaire!,
        statut: "NON_PAYE" as const,
      })),
      skipDuplicates: true,
    });
  }
}
