import { Bell } from "lucide-react";

export function Header({ title }: { title: string }) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-bg-card px-6">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      <button
        aria-label="Notifications"
        className="rounded-full p-2 text-text-secondary transition hover:bg-bg-page"
      >
        <Bell size={20} />
      </button>
    </header>
  );
}
