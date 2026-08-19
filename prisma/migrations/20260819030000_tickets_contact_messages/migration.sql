-- CreateEnum
CREATE TYPE "TicketUrgence" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE');

-- CreateEnum
CREATE TYPE "TicketStatut" AS ENUM ('OUVERT', 'EN_COURS', 'RESOLU');

-- CreateEnum
CREATE TYPE "ContactStatut" AS ENUM ('NOUVEAU', 'TRAITE');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "localisation" TEXT NOT NULL,
    "urgence" "TicketUrgence" NOT NULL DEFAULT 'MOYENNE',
    "statut" "TicketStatut" NOT NULL DEFAULT 'OUVERT',
    "signalePar" TEXT,
    "residenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "statut" "ContactStatut" NOT NULL DEFAULT 'NOUVEAU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tickets_residenceId_idx" ON "tickets"("residenceId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
