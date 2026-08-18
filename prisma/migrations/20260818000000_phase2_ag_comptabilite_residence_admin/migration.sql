-- CreateEnum
CREATE TYPE "AgType" AS ENUM ('ORDINAIRE', 'EXTRAORDINAIRE');

-- CreateEnum
CREATE TYPE "AgStatut" AS ENUM ('PLANIFIEE', 'CONVOQUEE', 'CLOTUREE');

-- CreateEnum
CREATE TYPE "TypeMajorite" AS ENUM ('ART24', 'ART25', 'ART26');

-- CreateEnum
CREATE TYPE "VoteValeur" AS ENUM ('POUR', 'CONTRE', 'ABSTENTION');

-- CreateEnum
CREATE TYPE "EcritureType" AS ENUM ('RECETTE', 'DEPENSE');

-- CreateTable
CREATE TABLE "residence_admins" (
    "id" TEXT NOT NULL,
    "residenceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "residence_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assemblees" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lieu" TEXT NOT NULL,
    "type" "AgType" NOT NULL DEFAULT 'ORDINAIRE',
    "statut" "AgStatut" NOT NULL DEFAULT 'PLANIFIEE',
    "convocationEnvoyee" BOOLEAN NOT NULL DEFAULT false,
    "residenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assemblees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolutions" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "typeMajorite" "TypeMajorite" NOT NULL DEFAULT 'ART24',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "agId" TEXT NOT NULL,

    CONSTRAINT "resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "resolutionId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valeur" "VoteValeur" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_comptables" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "type" "EcritureType" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "categorie" TEXT NOT NULL,
    "pieceJointeUrl" TEXT,
    "residenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecritures_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relances" (
    "id" TEXT NOT NULL,
    "quotePartId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "envoyeeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "envoyeeParId" TEXT,

    CONSTRAINT "relances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "residence_admins_userId_idx" ON "residence_admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "residence_admins_residenceId_userId_key" ON "residence_admins"("residenceId", "userId");

-- CreateIndex
CREATE INDEX "assemblees_residenceId_idx" ON "assemblees"("residenceId");

-- CreateIndex
CREATE INDEX "resolutions_agId_idx" ON "resolutions"("agId");

-- CreateIndex
CREATE INDEX "votes_lotId_idx" ON "votes"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_resolutionId_lotId_key" ON "votes"("resolutionId", "lotId");

-- CreateIndex
CREATE INDEX "ecritures_comptables_residenceId_idx" ON "ecritures_comptables"("residenceId");

-- CreateIndex
CREATE INDEX "relances_quotePartId_idx" ON "relances"("quotePartId");

-- AddForeignKey
ALTER TABLE "residence_admins" ADD CONSTRAINT "residence_admins_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residence_admins" ADD CONSTRAINT "residence_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assemblees" ADD CONSTRAINT "assemblees_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolutions" ADD CONSTRAINT "resolutions_agId_fkey" FOREIGN KEY ("agId") REFERENCES "assemblees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "resolutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relances" ADD CONSTRAINT "relances_quotePartId_fkey" FOREIGN KEY ("quotePartId") REFERENCES "quote_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relances" ADD CONSTRAINT "relances_envoyeeParId_fkey" FOREIGN KEY ("envoyeeParId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
