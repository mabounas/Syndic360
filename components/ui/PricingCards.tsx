"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PricingPlan = {
  name: string;
  price: number;
  unit: string;
  tagline: string;
  items: string[];
  highlighted?: boolean;
  badge?: string;
};

export function PricingCards({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
      {plans.map((plan, idx) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className={cn(
            "flex flex-col rounded-[20px] border p-8 transition-shadow",
            plan.highlighted
              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
              : "border-border bg-bg-card hover:shadow-lg hover:shadow-black/5",
          )}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-lg font-bold">{plan.name}</span>
            {plan.badge && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-white">
                {plan.badge}
              </span>
            )}
          </div>

          <div className="mb-1 mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold">
              <NumberFlow value={plan.price} suffix=" MAD" format={{ maximumFractionDigits: 0 }} />
            </span>
            <span className={cn("text-sm", plan.highlighted ? "text-white/70" : "text-text-secondary")}>
              {plan.unit}
            </span>
          </div>

          <p className={cn("mb-6 text-sm", plan.highlighted ? "text-white/80" : "text-text-secondary")}>
            {plan.tagline}
          </p>

          <div className="mb-8 flex flex-col gap-3">
            {plan.items.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm">
                <Check
                  size={16}
                  className={cn("mt-0.5 flex-shrink-0", plan.highlighted ? "text-secondary" : "text-success")}
                />
                {item}
              </div>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            variant={plan.highlighted ? "secondary" : "outline"}
            className={cn(
              "mt-auto w-full rounded-full py-6 font-bold",
              !plan.highlighted && "border-none bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            <Link href="/register">Choisir {plan.name}</Link>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
