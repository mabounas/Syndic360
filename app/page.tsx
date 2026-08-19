import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  Upload,
  Users,
  Vote,
  Wallet,
} from "lucide-react";
import { SyndicLogo } from "@/components/ui/SyndicLogo";
import { PricingCards, type PricingPlan } from "@/components/ui/PricingCards";
import { LandingFaq } from "./LandingFaq";

const FEATURES = [
  {
    icon: Wallet,
    title: "Comptabilité & appels de charges",
    desc: "Budgets, appels de charges répartis aux tantièmes ou en forfait par lot, suivi des impayés et relances, résidence par résidence.",
  },
  {
    icon: Vote,
    title: "Assemblées générales en ligne",
    desc: "Résolutions, vote pondéré aux tantièmes, calcul automatique des majorités (art. 24, 25, 26 de la loi 18-00), du premier au dernier vote.",
  },
  {
    icon: Users,
    title: "Espace copropriétaire",
    desc: "Chaque copropriétaire consulte ses charges, vote à distance et accède à ses documents depuis son propre espace.",
  },
  {
    icon: FileText,
    title: "Gestion documentaire",
    desc: "Règlement, PV d'AG, contrats et budgets classés par résidence, avec des droits d'accès communs ou privés par lot.",
  },
  {
    icon: Upload,
    title: "Import Excel en masse",
    desc: "Onboardez une résidence entière — bâtiments, lots, tantièmes, copropriétaires — en un seul import, plutôt que lot par lot.",
  },
  {
    icon: LayoutDashboard,
    title: "Tableau de bord multi-résidences",
    desc: "Une vue d'ensemble sur tout votre portefeuille : résidences gérées, lots, impayés — pour les cabinets comme pour un conseil bénévole.",
  },
];

const HIGHLIGHTS = [
  { label: "Loi 18-00", caption: "Conformité marocaine" },
  { label: "Multi-résidences", caption: "Un compte, toutes vos résidences" },
  { label: "Art. 24 · 25 · 26", caption: "Majorités d'AG calculées automatiquement" },
  { label: "Excel", caption: "Import en masse des lots & copropriétaires" },
];

const PLANS: PricingPlan[] = [
  {
    name: "Bénévole",
    price: 20,
    unit: "/ lot / mois",
    tagline: "Pour un conseil syndical gérant sa propre résidence.",
    items: ["1 résidence", "Comptabilité & appels de charges", "Assemblées générales en ligne", "Espace copropriétaire"],
  },
  {
    name: "Pro",
    price: 10,
    unit: "/ lot / mois",
    tagline: "Pour un cabinet gérant plusieurs résidences.",
    items: ["Jusqu'à 2 résidences", "Minimum 500 lots facturés", "Toutes les fonctionnalités", "Support prioritaire"],
    highlighted: true,
    badge: "Populaire",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      {/* NAV */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <SyndicLogo size={30} />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#fonctionnalites" className="text-sm font-medium text-text-secondary hover:text-text-primary">
            Fonctionnalités
          </a>
          <a href="#tarifs" className="text-sm font-medium text-text-secondary hover:text-text-primary">
            Tarifs
          </a>
          <a href="#faq" className="text-sm font-medium text-text-secondary hover:text-text-primary">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-text-primary hover:text-primary">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Créer mon compte
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-4 py-1.5 text-sm font-semibold text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            La gestion de copropriété, simplement
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-text-primary">
            Le syndic qui parle enfin{" "}
            <span className="text-secondary">le même langage</span> que vous
          </h1>
          <p className="mb-9 max-w-lg text-lg leading-relaxed text-text-secondary">
            Comptabilité, assemblées générales, communication avec les copropriétaires : Syndic360
            réunit tout ce dont un syndic a besoin, pensé pour les cabinets comme pour les conseils
            syndicaux bénévoles au Maroc.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/register"
              className="rounded-full bg-secondary px-7 py-4 text-base font-bold text-white shadow-lg shadow-secondary/30 transition hover:bg-secondary-dark"
            >
              Créer mon compte
            </Link>
            <a href="#tarifs" className="flex items-center gap-1.5 text-base font-semibold text-text-primary hover:text-primary">
              Voir les tarifs
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[20px] border border-border bg-bg-card shadow-xl">
            <Image
              src="/hero-syndic.jpg"
              alt="Gestion de syndic de copropriété"
              width={474}
              height={166}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-primary px-5 py-4 text-white shadow-xl">
            <div className="text-xl font-bold">Art. 24 · 25 · 26</div>
            <div className="text-xs text-white/70">Majorités loi 18-00 calculées automatiquement</div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="border-y border-border bg-bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 text-center lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label}>
              <div className="text-2xl font-bold text-secondary">{h.label}</div>
              <div className="mt-1.5 text-sm text-text-secondary">{h.caption}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <span className="text-xs font-bold uppercase tracking-wide text-secondary">Fonctionnalités</span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-text-primary">
            Tout ce qu&apos;un syndic fait chaque jour, réuni au même endroit
          </h2>
          <p className="text-text-secondary">
            Pas besoin de jongler entre un tableur, une boîte mail et un cahier papier.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => (
            <div key={feat.title} className="rounded-[20px] border border-border bg-bg-card p-7">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <feat.icon size={22} className="text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">{feat.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="tarifs" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <span className="text-xs font-bold uppercase tracking-wide text-secondary">Tarifs</span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-text-primary">Un plan pour chaque syndic</h2>
          <p className="text-text-secondary">Sans engagement, résiliable à tout moment.</p>
        </div>
        <PricingCards plans={PLANS} />
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-bg-card py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wide text-secondary">FAQ</span>
            <h2 className="mt-3 text-3xl font-bold text-text-primary">Questions fréquentes</h2>
          </div>
          <LandingFaq />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto my-20 max-w-6xl rounded-[28px] bg-primary px-14 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Prêt à simplifier la gestion de vos résidences ?
        </h2>
        <p className="mb-8 text-white/70">
          Créez votre compte en quelques minutes, à partir de 10 Dhs par lot et par mois.
        </p>
        <Link
          href="/register"
          className="inline-block rounded-full bg-secondary px-8 py-4 text-base font-bold text-white hover:bg-secondary-dark"
        >
          Créer mon compte
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-10">
        <SyndicLogo size={22} />
        <Link href="/contact" className="text-sm font-medium text-text-secondary hover:text-primary">
          Nous contacter
        </Link>
        <span className="text-sm text-text-secondary">© 2026 Syndic360. Tous droits réservés.</span>
      </footer>
    </div>
  );
}
