-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'SYNDIC_ADMIN', 'GESTIONNAIRE', 'CONSEIL_BENEVOLE', 'COPROPRIETAIRE', 'PRESTATAIRE');

-- CreateEnum
CREATE TYPE "LotType" AS ENUM ('APPARTEMENT', 'COMMERCE', 'PARKING', 'CAVE');

-- CreateEnum
CREATE TYPE "AppelChargesStatut" AS ENUM ('BROUILLON', 'PUBLIE');

-- CreateEnum
CREATE TYPE "QuotePartStatut" AS ENUM ('EN_ATTENTE', 'PAYE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "DocumentDossier" AS ENUM ('REGLEMENT', 'PV_AG', 'CONTRATS', 'BUDGETS', 'DIVERS');

-- CreateEnum
CREATE TYPE "DocumentVisibilite" AS ENUM ('COMMUN', 'PRIVE');

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'BENEVOLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL,
    "organisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residences" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "nbLots" INTEGER NOT NULL DEFAULT 0,
    "organisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "residences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batiments" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nbEtages" INTEGER NOT NULL DEFAULT 0,
    "residenceId" TEXT NOT NULL,

    CONSTRAINT "batiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "type" "LotType" NOT NULL DEFAULT 'APPARTEMENT',
    "surface" DOUBLE PRECISION,
    "tantiemesGeneraux" INTEGER NOT NULL DEFAULT 0,
    "tantiemesCharges" INTEGER NOT NULL DEFAULT 0,
    "etage" INTEGER,
    "batimentId" TEXT NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_proprietaires" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "lot_proprietaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "fondsTravauxMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "residenceId" TEXT NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appels_charges" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "statut" "AppelChargesStatut" NOT NULL DEFAULT 'BROUILLON',
    "budgetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appels_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_parts" (
    "id" TEXT NOT NULL,
    "appelChargesId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" "QuotePartStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "datePaiement" TIMESTAMP(3),
    "stripePaymentIntentId" TEXT,
    "cmiRef" TEXT,

    CONSTRAINT "quote_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "dossier" "DocumentDossier" NOT NULL DEFAULT 'DIVERS',
    "visibilite" "DocumentVisibilite" NOT NULL DEFAULT 'COMMUN',
    "residenceId" TEXT NOT NULL,
    "lotId" TEXT,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cible" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organisationId_idx" ON "users"("organisationId");

-- CreateIndex
CREATE INDEX "residences_organisationId_idx" ON "residences"("organisationId");

-- CreateIndex
CREATE INDEX "batiments_residenceId_idx" ON "batiments"("residenceId");

-- CreateIndex
CREATE INDEX "lots_batimentId_idx" ON "lots"("batimentId");

-- CreateIndex
CREATE INDEX "lot_proprietaires_userId_idx" ON "lot_proprietaires"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "lot_proprietaires_lotId_userId_key" ON "lot_proprietaires"("lotId", "userId");

-- CreateIndex
CREATE INDEX "budgets_residenceId_idx" ON "budgets"("residenceId");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_residenceId_annee_key" ON "budgets"("residenceId", "annee");

-- CreateIndex
CREATE INDEX "appels_charges_budgetId_idx" ON "appels_charges"("budgetId");

-- CreateIndex
CREATE INDEX "quote_parts_lotId_idx" ON "quote_parts"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "quote_parts_appelChargesId_lotId_key" ON "quote_parts"("appelChargesId", "lotId");

-- CreateIndex
CREATE INDEX "documents_residenceId_idx" ON "documents"("residenceId");

-- CreateIndex
CREATE INDEX "documents_lotId_idx" ON "documents"("lotId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residences" ADD CONSTRAINT "residences_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batiments" ADD CONSTRAINT "batiments_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_batimentId_fkey" FOREIGN KEY ("batimentId") REFERENCES "batiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_proprietaires" ADD CONSTRAINT "lot_proprietaires_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_proprietaires" ADD CONSTRAINT "lot_proprietaires_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appels_charges" ADD CONSTRAINT "appels_charges_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_parts" ADD CONSTRAINT "quote_parts_appelChargesId_fkey" FOREIGN KEY ("appelChargesId") REFERENCES "appels_charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_parts" ADD CONSTRAINT "quote_parts_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
