import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/rbac";
import { Header } from "@/components/layout/Header";
import { MonVoteForm } from "./MonVoteForm";

const MAJORITE_LABELS: Record<string, string> = {
  ART24: "Art. 24 — majorité simple",
  ART25: "Art. 25 — majorité absolue",
  ART26: "Art. 26 — double majorité",
};

const STATUT_LABELS: Record<string, string> = {
  PLANIFIEE: "Planifiée",
  CONVOQUEE: "Vote ouvert",
  CLOTUREE: "Clôturée",
};

export default async function MesAssembleesPage() {
  const session = await requireSession();
  if (isStaffRole(session.role)) redirect("/dashboard");

  const myLots = await prisma.lot.findMany({
    where: { proprietaires: { some: { userId: session.sub } } },
    select: { id: true, numero: true, batiment: { select: { residenceId: true } } },
  });
  const residenceIds = [...new Set(myLots.map((l) => l.batiment.residenceId))];

  const assemblees = await prisma.ag.findMany({
    where: { residenceId: { in: residenceIds } },
    orderBy: { date: "desc" },
    include: {
      residence: { select: { nom: true, batiments: { include: { lots: true } } } },
      resolutions: { orderBy: { ordre: "asc" }, include: { votes: true } },
    },
  });

  return (
    <div className="space-y-6">
      <Header title="Mes assemblées" />

      {assemblees.map((ag) => {
        const allLots = ag.residence.batiments.flatMap((b) => b.lots);
        const myLotsInResidence = myLots.filter((l) =>
          allLots.some((rl) => rl.id === l.id)
        );
        const totalTantiemes = allLots.reduce((s, l) => s + l.tantiemesGeneraux, 0);

        return (
          <div key={ag.id} className="rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
            <p className="text-sm font-medium text-text-primary">
              {ag.residence.nom} — AG {ag.type === "ORDINAIRE" ? "ordinaire" : "extraordinaire"} du{" "}
              {new Date(ag.date).toLocaleDateString("fr-MA")}{" "}
              <span className="text-text-secondary">
                · {ag.lieu} · {STATUT_LABELS[ag.statut]}
              </span>
            </p>

            <div className="mt-3 space-y-3">
              {ag.resolutions.map((resolution) => {
                const tantiemesParLot = new Map(allLots.map((l) => [l.id, l.tantiemesGeneraux]));
                let pour = 0,
                  contre = 0,
                  abstention = 0;
                for (const v of resolution.votes) {
                  const poids = tantiemesParLot.get(v.lotId) ?? 0;
                  if (v.valeur === "POUR") pour += poids;
                  else if (v.valeur === "CONTRE") contre += poids;
                  else abstention += poids;
                }

                return (
                  <div key={resolution.id} className="rounded-[var(--radius-button)] bg-bg-page p-3">
                    <p className="text-sm font-medium text-text-primary">{resolution.titre}</p>
                    <p className="text-sm text-text-secondary">{resolution.description}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {MAJORITE_LABELS[resolution.typeMajorite]}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Pour : {pour} · Contre : {contre} · Abstention : {abstention} / {totalTantiemes} tantièmes
                    </p>
                    {myLotsInResidence.length > 0 && (
                      <MonVoteForm
                        resolutionId={resolution.id}
                        myLots={myLotsInResidence}
                        existingVotes={resolution.votes
                          .filter((v) => myLotsInResidence.some((l) => l.id === v.lotId))
                          .map((v) => ({ lotId: v.lotId, valeur: v.valeur }))}
                        disabled={ag.statut !== "CONVOQUEE"}
                      />
                    )}
                  </div>
                );
              })}
              {ag.resolutions.length === 0 && (
                <p className="text-sm text-text-secondary">Aucune résolution à l&apos;ordre du jour.</p>
              )}
            </div>
          </div>
        );
      })}

      {assemblees.length === 0 && (
        <p className="text-sm text-text-secondary">Aucune assemblée pour le moment.</p>
      )}
    </div>
  );
}
