import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  organisationNom: z.string().min(2, "Nom d'organisation trop court"),
  plan: z.enum(["BENEVOLE", "PRO"]),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.email("Adresse email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const residenceSchema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  adresse: z.string().min(2, "Adresse requise"),
  ville: z.string().min(2, "Ville requise"),
});
export type ResidenceInput = z.infer<typeof residenceSchema>;

export const batimentSchema = z.object({
  residenceId: z.string().min(1),
  nom: z.string().min(1, "Nom requis"),
  nbEtages: z.coerce.number().int().min(0),
});
export type BatimentInput = z.infer<typeof batimentSchema>;

export const lotSchema = z.object({
  batimentId: z.string().min(1),
  numero: z.string().min(1, "Numéro requis"),
  type: z.enum(["APPARTEMENT", "COMMERCE", "PARKING", "CAVE"]),
  surface: z.coerce.number().min(0).optional(),
  tantiemesGeneraux: z.coerce.number().int().min(0),
  tantiemesCharges: z.coerce.number().int().min(0),
  etage: z.coerce.number().int().optional(),
  montantForfaitaire: z.coerce.number().min(0).optional(),
});
export type LotInput = z.infer<typeof lotSchema>;

export const lotUpdateSchema = z.object({
  numero: z.string().min(1, "Numéro requis").optional(),
  type: z.enum(["APPARTEMENT", "COMMERCE", "PARKING", "CAVE"]).optional(),
  surface: z.coerce.number().min(0).nullable().optional(),
  tantiemesGeneraux: z.coerce.number().int().min(0).optional(),
  tantiemesCharges: z.coerce.number().int().min(0).optional(),
  etage: z.coerce.number().int().nullable().optional(),
  montantForfaitaire: z.coerce.number().min(0).nullable().optional(),
});
export type LotUpdateInput = z.infer<typeof lotUpdateSchema>;

export const assignProprietaireSchema = z.object({
  email: z.email("Adresse email invalide"),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  telephone: z.string().optional(),
  typeOccupant: z.enum(["PROPRIETAIRE", "LOCATAIRE"]),
  password: z.union([z.string().min(8, "8 caractères minimum"), z.literal("")]).optional(),
});
export type AssignProprietaireInput = z.infer<typeof assignProprietaireSchema>;

export const activerCompteSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  telephone: z.string().optional(),
  email: z.email("Adresse email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});
export type ActiverCompteInput = z.infer<typeof activerCompteSchema>;

export const budgetSchema = z.object({
  residenceId: z.string().min(1),
  annee: z.coerce.number().int().min(2000),
  montantTotal: z.coerce.number().min(0),
  fondsTravauxMin: z.coerce.number().min(0),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const appelChargesSchema = z.object({
  budgetId: z.string().min(1),
  periode: z.string().min(1, "Période requise"),
  dateEcheance: z.string().min(1, "Date d'échéance requise"),
  repartition: z.enum(["TANTIEMES", "FORFAIT"]),
  montantTotal: z.coerce.number().min(0).optional(),
});
export type AppelChargesInput = z.infer<typeof appelChargesSchema>;

export const quotePartUpdateSchema = z.object({
  statut: z.enum(["EN_ATTENTE", "PAYE", "EN_RETARD"]),
});
export type QuotePartUpdateInput = z.infer<typeof quotePartUpdateSchema>;

export const agSchema = z.object({
  residenceId: z.string().min(1),
  date: z.string().min(1, "Date requise"),
  lieu: z.string().min(1, "Lieu requis"),
  type: z.enum(["ORDINAIRE", "EXTRAORDINAIRE"]),
});
export type AgInput = z.infer<typeof agSchema>;

export const resolutionSchema = z.object({
  titre: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  typeMajorite: z.enum(["ART24", "ART25", "ART26"]),
});
export type ResolutionInput = z.infer<typeof resolutionSchema>;

export const voteSchema = z.object({
  lotId: z.string().min(1),
  valeur: z.enum(["POUR", "CONTRE", "ABSTENTION"]),
});
export type VoteInput = z.infer<typeof voteSchema>;

export const ecritureSchema = z.object({
  residenceId: z.string().min(1),
  date: z.string().min(1, "Date requise"),
  libelle: z.string().min(1, "Libellé requis"),
  type: z.enum(["RECETTE", "DEPENSE"]),
  montant: z.coerce.number().min(0),
  categorie: z.string().min(1, "Catégorie requise"),
  pieceJointeUrl: z.string().optional(),
});
export type EcritureInput = z.infer<typeof ecritureSchema>;

export const documentSchema = z.object({
  residenceId: z.string().min(1),
  lotId: z.string().optional(),
  nom: z.string().min(1, "Nom requis"),
  type: z.string().min(1),
  url: z.string().min(1),
  taille: z.coerce.number().int().min(0),
  dossier: z.enum(["REGLEMENT", "PV_AG", "CONTRATS", "BUDGETS", "DIVERS"]),
  visibilite: z.enum(["COMMUN", "PRIVE"]),
});
export type DocumentInput = z.infer<typeof documentSchema>;
