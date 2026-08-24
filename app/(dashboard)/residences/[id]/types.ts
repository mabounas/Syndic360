export type LotOwner = {
  typeOccupant: "PROPRIETAIRE" | "LOCATAIRE";
  user: { id: string; nom: string; prenom: string; email: string; telephone: string | null };
};

export type LotWithOwners = {
  id: string;
  numero: string;
  type: "APPARTEMENT" | "COMMERCE" | "PARKING" | "CAVE";
  surface: number | null;
  tantiemesGeneraux: number;
  tantiemesCharges: number;
  etage: number | null;
  montantForfaitaire: number | null;
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

export type LotOption = {
  id: string;
  numero: string;
};

export type VoteLot = LotOption & {
  tantiemesGeneraux: number;
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

export type CoproprietaireFinanceRow = {
  lotId: string;
  lotNumero: string;
  occupants: { nom: string; prenom: string; email: string }[];
  soldeComptable: number;
  situation: "A_JOUR" | "EN_ATTENTE" | "EN_RETARD";
  historique: {
    annee: number;
    periode: string;
    montant: number;
    statut: "PAYE" | "EN_ATTENTE" | "EN_RETARD";
    datePaiement: Date | null;
  }[];
};

export type TicketRow = {
  id: string;
  titre: string;
  description: string;
  localisation: string;
  urgence: "BASSE" | "MOYENNE" | "HAUTE";
  statut: "OUVERT" | "EN_COURS" | "RESOLU";
  signalePar: string | null;
  createdAt: Date;
};

export type ResidenceSettings = {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  totalTantiemes: number;
};

export type OrganisationSettings = {
  id: string;
  nom: string;
  iban: string | null;
  bic: string | null;
  contactPrenom: string | null;
  contactNom: string | null;
  contactEmail: string | null;
  contactTelephone: string | null;
};
