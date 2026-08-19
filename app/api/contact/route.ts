import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/rbac";
import { contactSchema } from "@/lib/validation";
import { sendContactMessageEmail } from "@/lib/email";

// Formulaire de contact public — accessible sans authentification, adressé
// au(x) SUPER_ADMIN de la plateforme (pas rattaché à une organisation).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({ data: parsed.data });

    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { email: true },
    });
    await Promise.allSettled(
      superAdmins.map((admin) => sendContactMessageEmail(admin.email, parsed.data))
    );

    return NextResponse.json({ id: contactMessage.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
