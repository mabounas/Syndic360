"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Comment ajouter les résidences que je gère déjà ?",
    a: "Vous importez vos lots et copropriétaires en une fois via un fichier Excel (modèle fourni), ou vous les saisissez manuellement lot par lot — au choix.",
  },
  {
    q: "Le vote en assemblée générale à distance est-il valable ?",
    a: "Le calcul des majorités suit le formalisme de la loi 18-00 (art. 24, 25 et 26), pondéré aux tantièmes de chaque lot, que le vote ait lieu en séance ou à distance.",
  },
  {
    q: "Peut-on utiliser Syndic360 sans être syndic professionnel ?",
    a: "Oui. Le plan Bénévole (20 Dhs/lot/mois, 1 résidence) est pensé pour les conseils syndicaux non-professionnels qui gèrent leur propre résidence.",
  },
  {
    q: "Comment sont réparties les charges entre les lots ?",
    a: "Au choix, au prorata des tantièmes de chaque lot, ou en forfait — chaque lot ayant alors son propre montant fixe, une pratique courante des syndics au Maroc.",
  },
  {
    q: "Où sont hébergées nos données ?",
    a: "Sur une infrastructure cloud sécurisée (Vercel / PostgreSQL Neon), avec chiffrement des communications. Vos documents restent exportables à tout moment.",
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => (
        <div key={faq.q} className="overflow-hidden rounded-[var(--radius-card)] bg-bg-card border border-border">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-medium text-text-primary">{faq.q}</span>
            <span className="ml-4 flex-shrink-0 text-lg text-secondary">{open === i ? "–" : "+"}</span>
          </button>
          {open === i && (
            <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
