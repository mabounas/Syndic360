import ExcelJS from "exceljs";

export const IMPORT_COLUMNS = [
  "Bâtiment",
  "Lot",
  "Type",
  "Étage",
  "Surface m²",
  "Tantièmes généraux",
  "Tantièmes charges",
  "Montant forfaitaire",
  "Copropriétaire - Prénom",
  "Copropriétaire - Nom",
  "Copropriétaire - Email",
  "Copropriétaire - Téléphone",
  "Copropriétaire - Type (Propriétaire/Locataire)",
] as const;

const LOT_TYPES = ["APPARTEMENT", "COMMERCE", "PARKING", "CAVE"] as const;
type LotTypeValue = (typeof LOT_TYPES)[number];

const OCCUPANT_TYPES = ["PROPRIETAIRE", "LOCATAIRE"] as const;
type OccupantTypeValue = (typeof OCCUPANT_TYPES)[number];

export type ImportRow = {
  line: number;
  batiment: string;
  numero: string;
  type: LotTypeValue;
  etage: number | null;
  surface: number | null;
  tantiemesGeneraux: number;
  tantiemesCharges: number;
  montantForfaitaire: number | null;
  proprietairePrenom: string | null;
  proprietaireNom: string | null;
  proprietaireEmail: string | null;
  proprietaireTelephone: string | null;
  typeOccupant: OccupantTypeValue;
};

export type ImportParseResult = {
  rows: ImportRow[];
  errors: { line: number; message: string }[];
};

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) return String(value.text ?? "");
  return String(value).trim();
}

function cellNumber(value: ExcelJS.CellValue): number | null {
  const text = cellText(value);
  if (!text) return null;
  const n = Number(text.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function parseResidentsWorkbook(buffer: Buffer): Promise<ImportParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { rows: [], errors: [{ line: 0, message: "Fichier vide." }] };

  const headerRow = sheet.getRow(1);
  const headerIndex = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    headerIndex.set(cellText(cell.value).trim(), colNumber);
  });

  const get = (row: ExcelJS.Row, col: string) => {
    const idx = headerIndex.get(col);
    return idx ? row.getCell(idx).value : null;
  };

  const rows: ImportRow[] = [];
  const errors: { line: number; message: string }[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const batiment = cellText(get(row, "Bâtiment"));
    const numero = cellText(get(row, "Lot"));
    if (!batiment && !numero) return; // ligne vide

    if (!batiment) {
      errors.push({ line: rowNumber, message: "Bâtiment manquant." });
      return;
    }
    if (!numero) {
      errors.push({ line: rowNumber, message: "Numéro de lot manquant." });
      return;
    }

    const typeRaw = cellText(get(row, "Type")).toUpperCase();
    const type: LotTypeValue = LOT_TYPES.includes(typeRaw as LotTypeValue)
      ? (typeRaw as LotTypeValue)
      : "APPARTEMENT";

    const tantiemesGeneraux = cellNumber(get(row, "Tantièmes généraux"));
    const tantiemesCharges = cellNumber(get(row, "Tantièmes charges"));
    if (tantiemesGeneraux === null || tantiemesCharges === null) {
      errors.push({ line: rowNumber, message: "Tantièmes généraux/charges manquants ou invalides." });
      return;
    }

    const proprietairePrenom = cellText(get(row, "Copropriétaire - Prénom")) || null;
    const proprietaireNom = cellText(get(row, "Copropriétaire - Nom")) || null;
    const proprietaireEmail = cellText(get(row, "Copropriétaire - Email")) || null;
    const proprietaireTelephone = cellText(get(row, "Copropriétaire - Téléphone")) || null;
    const typeOccupantRaw = cellText(
      get(row, "Copropriétaire - Type (Propriétaire/Locataire)")
    ).toUpperCase();
    const typeOccupant: OccupantTypeValue = OCCUPANT_TYPES.includes(
      typeOccupantRaw as OccupantTypeValue
    )
      ? (typeOccupantRaw as OccupantTypeValue)
      : "PROPRIETAIRE";

    if ((proprietairePrenom || proprietaireNom) && !proprietaireEmail) {
      errors.push({ line: rowNumber, message: "Email du copropriétaire manquant." });
      return;
    }
    if (proprietaireEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proprietaireEmail)) {
      errors.push({ line: rowNumber, message: "Email du copropriétaire invalide." });
      return;
    }

    rows.push({
      line: rowNumber,
      batiment,
      numero,
      type,
      etage: cellNumber(get(row, "Étage")),
      surface: cellNumber(get(row, "Surface m²")),
      tantiemesGeneraux,
      tantiemesCharges,
      montantForfaitaire: cellNumber(get(row, "Montant forfaitaire")),
      proprietairePrenom,
      proprietaireNom,
      proprietaireEmail,
      proprietaireTelephone,
      typeOccupant,
    });
  });

  return { rows, errors };
}

export async function buildResidentsTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Lots & copropriétaires");
  sheet.columns = IMPORT_COLUMNS.map((header) => ({ header, key: header, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({
    "Bâtiment": "Bâtiment A",
    Lot: "A101",
    Type: "APPARTEMENT",
    "Étage": 1,
    "Surface m²": 75,
    "Tantièmes généraux": 120,
    "Tantièmes charges": 120,
    "Montant forfaitaire": 300,
    "Copropriétaire - Prénom": "Fatima",
    "Copropriétaire - Nom": "Alaoui",
    "Copropriétaire - Email": "fatima.alaoui@example.com",
    "Copropriétaire - Téléphone": "0661234567",
    "Copropriétaire - Type (Propriétaire/Locataire)": "PROPRIETAIRE",
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
