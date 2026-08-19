"use client";

import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} rounded-[var(--radius-card)] border border-border bg-bg-card p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-danger">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
