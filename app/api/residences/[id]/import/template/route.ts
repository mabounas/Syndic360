import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { buildResidentsTemplate } from "@/lib/excel";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const { id } = await params;
    await assertResidenceAccess(session, id);

    const buffer = await buildResidentsTemplate();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="syndic360-import-modele.xlsx"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
