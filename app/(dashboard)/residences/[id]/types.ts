export type LotOwner = {
  user: { id: string; nom: string; prenom: string; email: string };
};

export type LotWithOwners = {
  id: string;
  numero: string;
  type: "APPARTEMENT" | "COMMERCE" | "PARKING" | "CAVE";
  surface: number | null;
  tantiemesGeneraux: number;
  tantiemesCharges: number;
  etage: number | null;
  proprietaires: LotOwner[];
};

export type BatimentWithLots = {
  id: string;
  nom: string;
  nbEtages: number;
  lots: LotWithOwners[];
};

export type QuotePartRow = {
  id: string;
  montant: number;
  statut: "PAYE" | "EN_ATTENTE" | "EN_RETARD";
  datePaiement: Date | null;
  lot: { numero: string };
  relances: { id: string; type: string; envoyeeAt: Date }[];
};

export type AppelWithQuoteParts = {
  id: string;
  periode: string;
  dateEcheance: Date;
  montantTotal: number;
  statut: "BROUILLON" | "PUBLIE";
  quoteParts: QuotePartRow[];
};

export type BudgetWithAppels = {
  id: string;
  annee: number;
  montantTotal: number;
  fondsTravauxMin: number;
  appelsCharges: AppelWithQuoteParts[];
};

export type VoteRow = {
  id: string;
  lotId: string;
  valeur: "POUR" | "CONTRE" | "ABSTENTION";
};

export type ResolutionRow = {
  id: string;
  titre: string;
  description: string;
  typeMajorite: "ART24" | "ART25" | "ART26";
  ordre: number;
  votes: VoteRow[];
};

export type AgRow = {
  id: string;
  date: Date;
  lieu: string;
  type: "ORDINAIRE" | "EXTRAORDINAIRE";
  statut: "PLANIFIEE" | "CONVOQUEE" | "CLOTUREE";
  convocationEnvoyee: boolean;
  resolutions: ResolutionRow[];
};

export type EcritureRow = {
  id: string;
  date: Date;
  libelle: string;
  type: "RECETTE" | "DEPENSE";
  montant: number;
  categorie: string;
  pieceJointeUrl: string | null;
};

export type DocumentRow = {
  id: string;
  nom: string;
  type: string;
  url: string;
  taille: number;
  dossier: "REGLEMENT" | "PV_AG" | "CONTRATS" | "BUDGETS" | "DIVERS";
  visibilite: "COMMUN" | "PRIVE";
  createdAt: Date;
  lotId: string | null;
};
