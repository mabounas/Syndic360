import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { OrganisationSettingsForm } from "./OrganisationSettingsForm";

export default async function ParametresPage() {
  const session = await requireSession();
  if (session.role !== "SYNDIC_ADMIN") redirect("/dashboard");

  const organisation = await prisma.organisation.findUniqueOrThrow({
    where: { id: session.organisationId },
    select: {
      id: true,
      nom: true,
      iban: true,
      bic: true,
      contactPrenom: true,
      contactNom: true,
      contactEmail: true,
      contactTelephone: true,
    },
  });

  return (
    <div className="space-y-6">
      <Header title="Paramètres" />
      <p className="-mt-4 text-sm text-text-secondary">
        Coordonnées bancaires et contact du syndic — communs à toutes vos résidences.
      </p>
      <OrganisationSettingsForm organisation={organisation} />
    </div>
  );
}
