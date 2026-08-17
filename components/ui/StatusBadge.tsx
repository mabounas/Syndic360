import { cn } from "@/lib/utils";

type Status = "PAYE" | "EN_ATTENTE" | "EN_RETARD";

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  PAYE: { label: "Payé", className: "bg-success/10 text-success" },
  EN_ATTENTE: { label: "En attente", className: "bg-warning/10 text-warning" },
  EN_RETARD: { label: "En retard", className: "bg-danger/10 text-danger" },
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: Status;
  size?: "sm" | "md";
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      )}
    >
      {config.label}
    </span>
  );
}
