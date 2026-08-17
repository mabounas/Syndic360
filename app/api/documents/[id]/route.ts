import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, notFound, requireStaffRole } from "@/lib/rbac";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) notFound("Document introuvable.");
    await assertResidenceAccess(session, document!.residenceId);

    await del(document!.url).catch(() => {
      // Le fichier a peut-être déjà été supprimé côté stockage — on ne bloque pas la suppression du record.
    });
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
