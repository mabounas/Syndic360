import { SyndicLogo } from "@/components/ui/SyndicLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-page px-4 py-12">
      <div className="mb-8">
        <SyndicLogo size={40} />
      </div>
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
