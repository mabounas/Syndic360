"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      <LogOut size={16} />
      Déconnexion
    </button>
  );
}
