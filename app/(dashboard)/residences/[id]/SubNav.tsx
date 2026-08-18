"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SubNav({ residenceId }: { residenceId: string }) {
  const pathname = usePathname();
  const base = `/residences/${residenceId}`;

  const tabs = [
    { href: base, label: "Lots & copropriétaires" },
    { href: `${base}/finances`, label: "Finances" },
    { href: `${base}/assemblees`, label: "Assemblées" },
    { href: `${base}/comptabilite`, label: "Comptabilité" },
    { href: `${base}/documents`, label: "Documents" },
    { href: `${base}/administrateurs`, label: "Administrateurs" },
  ];

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const active = tab.href === base ? pathname === base : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-t-[var(--radius-button)] px-4 py-2 text-sm transition",
              active
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
