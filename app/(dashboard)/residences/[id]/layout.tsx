import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole, residenceScopeWhere } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { SubNav } from "./SubNav";

export default async function ResidenceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (!isStaffRole(session.role)) redirect("/mes-charges");

  const { id } = await params;
  const residence = await prisma.residence.findFirst({
    where: { id, ...residenceScopeWhere(session) },
    select: { id: true, nom: true, adresse: true, ville: true },
  });
  if (!residence) notFound();

  return (
    <div className="space-y-6">
      <Header title={residence.nom} />
      <p className="-mt-4 text-sm text-text-secondary">
        {residence.adresse}, {residence.ville}
      </p>
      <SubNav residenceId={residence.id} />
      {children}
    </div>
  );
}
