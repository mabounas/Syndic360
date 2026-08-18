import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Passw0rd!";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Organisation "équipe Syndic360" — porte uniquement le compte SUPER_ADMIN (accès plateforme).
  const orgSyndic360 = await prisma.organisation.create({
    data: { nom: "Équipe Syndic360", plan: "ENTERPRISE" },
  });

  // Cabinet professionnel gérant plusieurs résidences.
  const orgCabinet = await prisma.organisation.create({
    data: { nom: "Cabinet Syndic Demo", plan: "PRO" },
  });

  // Syndic bénévole : une organisation = une seule résidence (plan gratuit, section 6.10 du CDC).
  const orgBenevole = await prisma.organisation.create({
    data: { nom: "Conseil Syndical Les Palmiers", plan: "BENEVOLE" },
  });

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@syndic360.ma",
      passwordHash,
      nom: "Admin",
      prenom: "Super",
      role: "SUPER_ADMIN",
      organisationId: orgSyndic360.id,
    },
  });

  const gestionnaire = await prisma.user.create({
    data: {
      email: "gestionnaire@syndic360.ma",
      passwordHash,
      nom: "Bennani",
      prenom: "Yasmine",
      role: "GESTIONNAIRE",
      organisationId: orgCabinet.id,
    },
  });

  const conseilBenevole = await prisma.user.create({
    data: {
      email: "conseil@syndic360.ma",
      passwordHash,
      nom: "Idrissi",
      prenom: "Karim",
      role: "CONSEIL_BENEVOLE",
      organisationId: orgBenevole.id,
    },
  });

  const proprio1 = await prisma.user.create({
    data: {
      email: "proprio1@syndic360.ma",
      passwordHash,
      nom: "Alaoui",
      prenom: "Fatima",
      role: "COPROPRIETAIRE",
      organisationId: orgCabinet.id,
    },
  });

  const proprio2 = await prisma.user.create({
    data: {
      email: "proprio2@syndic360.ma",
      passwordHash,
      nom: "Tazi",
      prenom: "Omar",
      role: "COPROPRIETAIRE",
      organisationId: orgCabinet.id,
    },
  });

  const proprio3 = await prisma.user.create({
    data: {
      email: "proprio3@syndic360.ma",
      passwordHash,
      nom: "Chraibi",
      prenom: "Salma",
      role: "COPROPRIETAIRE",
      organisationId: orgBenevole.id,
    },
  });

  const residence1 = await prisma.residence.create({
    data: {
      nom: "Résidence Al Manar",
      adresse: "12 Rue des Orangers",
      ville: "Casablanca",
      nbLots: 4,
      organisationId: orgCabinet.id,
    },
  });

  const residence2 = await prisma.residence.create({
    data: {
      nom: "Résidence Les Palmiers",
      adresse: "45 Avenue Hassan II",
      ville: "Rabat",
      nbLots: 2,
      organisationId: orgBenevole.id,
    },
  });

  await prisma.residenceAdmin.create({
    data: { residenceId: residence1.id, userId: gestionnaire.id },
  });
  await prisma.residenceAdmin.create({
    data: { residenceId: residence2.id, userId: conseilBenevole.id },
  });

  const batimentA = await prisma.batiment.create({
    data: { nom: "Bâtiment A", nbEtages: 2, residenceId: residence1.id },
  });

  const batimentUnique = await prisma.batiment.create({
    data: { nom: "Bâtiment Unique", nbEtages: 1, residenceId: residence2.id },
  });

  const lotA101 = await prisma.lot.create({
    data: {
      numero: "A101",
      type: "APPARTEMENT",
      surface: 75,
      tantiemesGeneraux: 120,
      tantiemesCharges: 120,
      etage: 1,
      montantForfaitaire: 300,
      batimentId: batimentA.id,
    },
  });

  const lotA102 = await prisma.lot.create({
    data: {
      numero: "A102",
      type: "APPARTEMENT",
      surface: 90,
      tantiemesGeneraux: 140,
      tantiemesCharges: 140,
      etage: 1,
      montantForfaitaire: 350,
      batimentId: batimentA.id,
    },
  });

  await prisma.lot.create({
    data: {
      numero: "A201",
      type: "APPARTEMENT",
      surface: 75,
      tantiemesGeneraux: 120,
      tantiemesCharges: 120,
      etage: 2,
      montantForfaitaire: 300,
      batimentId: batimentA.id,
    },
  });

  await prisma.lot.create({
    data: {
      numero: "PK-01",
      type: "PARKING",
      surface: 12,
      tantiemesGeneraux: 20,
      tantiemesCharges: 20,
      montantForfaitaire: 50,
      batimentId: batimentA.id,
    },
  });

  const lotL1 = await prisma.lot.create({
    data: {
      numero: "L1",
      type: "APPARTEMENT",
      surface: 80,
      tantiemesGeneraux: 500,
      tantiemesCharges: 500,
      etage: 0,
      montantForfaitaire: 250,
      batimentId: batimentUnique.id,
    },
  });

  await prisma.lot.create({
    data: {
      numero: "L2",
      type: "APPARTEMENT",
      surface: 85,
      tantiemesGeneraux: 500,
      tantiemesCharges: 500,
      etage: 0,
      montantForfaitaire: 250,
      batimentId: batimentUnique.id,
    },
  });

  await prisma.lotProprietaire.create({
    data: { lotId: lotA101.id, userId: proprio1.id },
  });
  await prisma.lotProprietaire.create({
    data: { lotId: lotA102.id, userId: proprio2.id },
  });
  await prisma.lotProprietaire.create({
    data: { lotId: lotL1.id, userId: proprio3.id },
  });

  const budget1 = await prisma.budget.create({
    data: {
      annee: 2026,
      montantTotal: 96000,
      fondsTravauxMin: 9600,
      residenceId: residence1.id,
    },
  });

  const appel1 = await prisma.appelCharges.create({
    data: {
      periode: "T1 2026",
      dateEcheance: new Date("2026-04-15"),
      montantTotal: 24000,
      statut: "PUBLIE",
      budgetId: budget1.id,
    },
  });

  await prisma.quotePart.create({
    data: {
      appelChargesId: appel1.id,
      lotId: lotA101.id,
      montant: 2400,
      statut: "PAYE",
      datePaiement: new Date("2026-04-02"),
    },
  });

  await prisma.quotePart.create({
    data: {
      appelChargesId: appel1.id,
      lotId: lotA102.id,
      montant: 2800,
      statut: "EN_RETARD",
    },
  });

  const budget2 = await prisma.budget.create({
    data: {
      annee: 2026,
      montantTotal: 18000,
      fondsTravauxMin: 1800,
      residenceId: residence2.id,
    },
  });

  const appel2 = await prisma.appelCharges.create({
    data: {
      periode: "T1 2026",
      dateEcheance: new Date("2026-04-15"),
      montantTotal: 4500,
      statut: "PUBLIE",
      budgetId: budget2.id,
    },
  });

  await prisma.quotePart.create({
    data: {
      appelChargesId: appel2.id,
      lotId: lotL1.id,
      montant: 2250,
      statut: "EN_ATTENTE",
    },
  });

  const ag1 = await prisma.ag.create({
    data: {
      date: new Date("2026-06-15"),
      lieu: "Hall d'entrée, Résidence Al Manar",
      type: "ORDINAIRE",
      statut: "CONVOQUEE",
      convocationEnvoyee: true,
      residenceId: residence1.id,
    },
  });

  const resolution1 = await prisma.resolution.create({
    data: {
      titre: "Ravalement de façade",
      description: "Approbation du devis de ravalement de façade pour un montant de 45 000 MAD.",
      typeMajorite: "ART25",
      ordre: 0,
      agId: ag1.id,
    },
  });

  await prisma.vote.create({
    data: { resolutionId: resolution1.id, lotId: lotA101.id, userId: proprio1.id, valeur: "POUR" },
  });
  await prisma.vote.create({
    data: { resolutionId: resolution1.id, lotId: lotA102.id, userId: gestionnaire.id, valeur: "CONTRE" },
  });

  await prisma.ecritureComptable.create({
    data: {
      date: new Date("2026-03-05"),
      libelle: "Contrat gardiennage T1",
      type: "DEPENSE",
      montant: 6000,
      categorie: "Gardiennage",
      residenceId: residence1.id,
    },
  });
  await prisma.ecritureComptable.create({
    data: {
      date: new Date("2026-04-02"),
      libelle: "Charges perçues T1 (lot A101)",
      type: "RECETTE",
      montant: 2400,
      categorie: "Charges perçues",
      residenceId: residence1.id,
    },
  });

  console.log("Seed terminé.");
  console.log("Comptes de démo (mot de passe pour tous : %s)", DEMO_PASSWORD);
  console.log("  SUPER_ADMIN       :", superAdmin.email, "(toutes organisations)");
  console.log("  GESTIONNAIRE      :", gestionnaire.email, "(Cabinet Syndic Demo — Al Manar)");
  console.log("  CONSEIL_BENEVOLE  :", conseilBenevole.email, "(Conseil Syndical Les Palmiers)");
  console.log("  COPROPRIETAIRE 1  :", proprio1.email, "(lot A101, Al Manar)");
  console.log("  COPROPRIETAIRE 2  :", proprio2.email, "(lot A102, Al Manar)");
  console.log("  COPROPRIETAIRE 3  :", proprio3.email, "(lot L1, Les Palmiers)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
