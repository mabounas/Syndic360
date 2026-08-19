import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertResidenceAccess, handleApiError, requireStaffRole } from "@/lib/rbac";
import { ticketSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    requireStaffRole(session);

    const body = await request.json().catch(() => null);
    const parsed = ticketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    await assertResidenceAccess(session, parsed.data.residenceId);

    const ticket = await prisma.ticket.create({ data: parsed.data });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
