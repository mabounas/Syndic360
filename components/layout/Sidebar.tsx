import Link from "next/link";
import { Building2, LayoutDashboard, Receipt, FileText, Vote, ShieldCheck } from "lucide-react";
import { SyndicLogo } from "@/components/ui/SyndicLogo";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { isStaffRole } from "@/lib/rbac";
import type { Role } from "@/app/generated/prisma/enums";

const STAFF_NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/residences", label: "Résidences", icon: Building2 },
];

const SUPER_ADMIN_NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/residences", label: "Résidences", icon: Building2 },
  { href: "/approbations", label: "Approbations", icon: ShieldCheck },
];

const COPROPRIETAIRE_NAV = [
  { href: "/mes-charges", label: "Mes charges", icon: Receipt },
  { href: "/mes-assemblees", label: "Mes assemblées", icon: Vote },
  { href: "/mes-documents", label: "Mes documents", icon: FileText },
];

export function Sidebar({
  role,
  nom,
  prenom,
}: {
  role: Role;
  nom: string;
  prenom: string;
}) {
  const items = role === "SUPER_ADMIN" ? SUPER_ADMIN_NAV : isStaffRole(role) ? STAFF_NAV : COPROPRIETAIRE_NAV;

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-bg-sidebar text-white">
      <div className="flex items-center border-b border-white/10 px-6 py-5">
        <SyndicLogo size={28} variant="light" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-2 px-3 text-sm text-white">
          {prenom} {nom}
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
