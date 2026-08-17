import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: "primary" | "secondary" | "success" | "danger" | "warning";
};

const COLOR_CLASSES: Record<NonNullable<KpiCardProps["color"]>, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
};

export function KpiCard({ label, value, icon: Icon, color = "primary" }: KpiCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        {Icon && (
          <div className={cn("rounded-full p-2", COLOR_CLASSES[color])}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
