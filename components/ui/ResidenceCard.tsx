import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

export function ResidenceCard({
  residence,
}: {
  residence: { id: string; nom: string; ville: string; nbLots: number };
}) {
  return (
    <Link
      href={`/residences/${residence.id}`}
      className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-bg-card p-5 transition hover:border-border-strong hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Building2 size={20} />
        </div>
        <div>
          <p className="font-medium text-text-primary">{residence.nom}</p>
          <p className="text-sm text-text-secondary">
            {residence.ville} · {residence.nbLots} lot(s)
          </p>
        </div>
      </div>
      <ChevronRight size={18} className="text-text-muted" />
    </Link>
  );
}
