-- CreateEnum
CREATE TYPE "TypeOccupant" AS ENUM ('PROPRIETAIRE', 'LOCATAIRE');

-- AlterTable
ALTER TABLE "lots" ADD COLUMN "montantForfaitaire" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "lot_proprietaires" ADD COLUMN "typeOccupant" "TypeOccupant" NOT NULL DEFAULT 'PROPRIETAIRE';
