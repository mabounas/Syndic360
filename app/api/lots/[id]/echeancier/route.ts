import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { assertLotAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { genererEcheancier } from "@/lib/echeancier";

// Démarre l'échéancier d'un lot (mois courant -> décembre de l'année en
// cours), à la demande explicite du syndic après confirmation côté client —
// jamais déclenché automatiquement.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id: lotId } = await params;
    await assertLotAccess(session, lotId);

    await genererEcheancier(lotId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
