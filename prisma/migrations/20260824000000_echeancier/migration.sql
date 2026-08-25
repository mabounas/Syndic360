-- CreateEnum
CREATE TYPE "EcheanceStatut" AS ENUM ('EN_COURS', 'NON_PAYE', 'PAYE');

-- AlterTable
ALTER TABLE "lots" ADD COLUMN "soldeDepart" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "echeances" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "mois" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" "EcheanceStatut" NOT NULL DEFAULT 'EN_COURS',
    "montantRecu" DOUBLE PRECISION,
    "datePaiement" TIMESTAMP(3),
    "referencePaiement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "echeances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "echeances_lotId_idx" ON "echeances"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "echeances_lotId_mois_key" ON "echeances"("lotId", "mois");

-- AddForeignKey
ALTER TABLE "echeances" ADD CONSTRAINT "echeances_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
