import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac";

// Émet un jeton d'upload direct-vers-Vercel-Blob côté client (voir DocumentUpload).
// Seuls les rôles "staff" (gestion) peuvent alimenter la GED en V1.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: 50 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {
        // Le record Document (nom, dossier, visibilité, résidence/lot) est créé
        // explicitement par le client via POST /api/documents après l'upload.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de l'upload." },
      { status: 400 }
    );
  }
}
