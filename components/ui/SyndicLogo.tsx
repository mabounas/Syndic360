import { cn } from "@/lib/utils";

type SyndicLogoProps = {
  size?: number;
  variant?: "colored" | "light" | "dark";
  className?: string;
};

const TEXT_COLORS: Record<NonNullable<SyndicLogoProps["variant"]>, { primary: string; secondary: string }> = {
  colored: { primary: "#0F4C81", secondary: "#E87722" },
  light: { primary: "#FFFFFF", secondary: "#F0923A" },
  dark: { primary: "#111928", secondary: "#E87722" },
};

// Logo SVG Syndic360 : arc partiel à 270° ("360°") + point central orange (section 2.4 du CDC).
export function SyndicLogo({
  size = 32,
  variant = "colored",
  className,
}: SyndicLogoProps) {
  const { primary, secondary } = TEXT_COLORS[variant];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M24 4a20 20 0 1 1 -14.14 5.86"
          stroke={primary}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="5" fill={secondary} />
      </svg>
      <span className="font-bold leading-none" style={{ fontSize: size * 0.5 }}>
        <span style={{ color: primary }}>Syndic</span>
        <span style={{ color: secondary }}>360</span>
      </span>
    </div>
  );
}
