import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { parseResidentsWorkbook } from "@/lib/excel";

function generateTempPassword() {
  return randomBytes(9).toString("base64url"); // ~12 caractères, lisible sans ambiguïté
}

// Import en masse des lots + copropriétaires d'une résidence depuis un fichier
// Excel (section 6.2 du CDC : "Import CSV/Excel d'une résidence existante").
// Traite chaque ligne indépendamment : une ligne en erreur n'annule pas les autres.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: residenceId } = await params;
    await assertResidenceAccess(session, residenceId);

    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { rows, errors: parseErrors } = await parseResidentsWorkbook(buffer);

    const batimentCache = new Map<string, string>();
    for (const b of await prisma.batiment.findMany({
      where: { residenceId },
      select: { id: true, nom: true },
    })) {
      batimentCache.set(b.nom, b.id);
    }

    let lotsCreated = 0;
    let proprietairesLinked = 0;
    const usersCreated: { email: string; password: string }[] = [];
    const rowErrors: { line: number; message: string }[] = [...parseErrors];

    for (const row of rows) {
      try {
        let batimentId = batimentCache.get(row.batiment);
        if (!batimentId) {
          const batiment = await prisma.batiment.create({
            data: { nom: row.batiment, residenceId },
          });
          batimentId = batiment.id;
          batimentCache.set(row.batiment, batimentId);
        }

        const lot = await prisma.lot.create({
          data: {
            numero: row.numero,
            type: row.type,
            surface: row.surface ?? undefined,
            etage: row.etage ?? undefined,
            tantiemesGeneraux: row.tantiemesGeneraux,
            tantiemesCharges: row.tantiemesCharges,
            montantForfaitaire: row.montantForfaitaire ?? undefined,
            batimentId,
          },
        });
        lotsCreated += 1;

        if (row.proprietaireEmail) {
          let user = await prisma.user.findUnique({ where: { email: row.proprietaireEmail } });
          if (!user) {
            const password = generateTempPassword();
            user = await prisma.user.create({
              data: {
                email: row.proprietaireEmail,
                passwordHash: await hashPassword(password),
                nom: row.proprietaireNom ?? "",
                prenom: row.proprietairePrenom ?? "",
                telephone: row.proprietaireTelephone ?? undefined,
                role: "COPROPRIETAIRE",
                organisationId: session.organisationId,
              },
            });
            usersCreated.push({ email: user.email, password });
          } else if (user.organisationId !== session.organisationId) {
            rowErrors.push({
              line: row.line,
              message: `Le lot a été créé, mais ${row.proprietaireEmail} appartient à une autre organisation et n'a pas été lié.`,
            });
            continue;
          }

          await prisma.lotProprietaire.upsert({
            where: { lotId_userId: { lotId: lot.id, userId: user.id } },
            create: { lotId: lot.id, userId: user.id, typeOccupant: row.typeOccupant },
            update: { typeOccupant: row.typeOccupant },
          });
          proprietairesLinked += 1;
        }
      } catch {
        rowErrors.push({ line: row.line, message: "Erreur lors de la création (doublon de lot possible)." });
      }
    }

    const nbLots = await prisma.lot.count({ where: { batiment: { residenceId } } });
    await prisma.residence.update({ where: { id: residenceId }, data: { nbLots } });

    return NextResponse.json({
      lotsCreated,
      proprietairesLinked,
      usersCreated,
      errors: rowErrors,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
