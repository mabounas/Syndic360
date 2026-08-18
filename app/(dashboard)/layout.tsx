import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { SyndicLogo } from "@/components/ui/SyndicLogo";
import { LogoutButton } from "@/components/layout/LogoutButton";

const STATUT_MESSAGES: Record<string, { title: string; body: string }> = {
  EN_ATTENTE: {
    title: "Compte en attente d'approbation",
    body: "Votre compte a bien été créé mais doit encore être approuvé avant de pouvoir accéder à Syndic360. Vous recevrez un email dès que ce sera fait.",
  },
  REJETE: {
    title: "Compte non approuvé",
    body: "Votre demande d'accès n'a pas été approuvée. Contactez le support si vous pensez qu'il s'agit d'une erreur.",
  },
  BLOQUE: {
    title: "Accès suspendu",
    body: "Votre accès a été suspendu. Contactez votre syndic ou le support pour plus d'informations.",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  // Le statut peut avoir changé depuis l'émission du JWT (approbation en attente) —
  // on revérifie toujours en base plutôt que de faire confiance au token.
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { statut: true },
  });

  if (user && user.statut !== "APPROUVE") {
    const info = STATUT_MESSAGES[user.statut] ?? STATUT_MESSAGES.EN_ATTENTE;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-page px-4 text-center">
        <SyndicLogo size={36} />
        <div className="max-w-md rounded-[var(--radius-card)] border border-border bg-bg-card p-8">
          <h1 className="mb-3 text-lg font-semibold text-text-primary">{info.title}</h1>
          <p className="text-sm text-text-secondary">{info.body}</p>
        </div>
        <LogoutButton variant="onLight" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={session.role} nom={session.nom} prenom={session.prenom} />
      <main className="flex-1 overflow-y-auto bg-bg-page">
        <div className="mx-auto max-w-[1400px] p-6">{children}</div>
      </main>
    </div>
  );
}
