import { Resend } from "resend";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL || "Syndic360 <onboarding@resend.dev>";
  if (!client) {
    console.warn("[email] RESEND_API_KEY absente — email non envoyé:", params.subject, "→", params.to);
    return;
  }
  try {
    await client.emails.send({ from, to: params.to, subject: params.subject, html: params.html });
  } catch (error) {
    console.error("[email] Échec d'envoi:", error);
  }
}

function wrapper(title: string, bodyHtml: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111928;">
    <h1 style="font-size:18px;color:#0F4C81;margin:0 0 16px;">${title}</h1>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#6B7280;">Syndic360 — Gérez votre copropriété à 360°</p>
  </div>`;
}

export function sendAccountPendingEmail(to: string, prenom: string, organisationNom: string) {
  return sendEmail({
    to,
    subject: "Syndic360 — Votre compte est en attente d'approbation",
    html: wrapper(
      "Compte créé",
      `<p>Bonjour ${prenom},</p>
       <p>Votre compte pour l'organisation <strong>${organisationNom}</strong> a bien été créé sur Syndic360.</p>
       <p>Il est actuellement <strong>en attente d'approbation</strong> par l'équipe Syndic360. Vous recevrez un email dès que votre compte sera activé.</p>`
    ),
  });
}

export function sendAccountApprovedEmail(to: string, prenom: string) {
  return sendEmail({
    to,
    subject: "Syndic360 — Votre compte a été approuvé",
    html: wrapper(
      "Compte approuvé",
      `<p>Bonjour ${prenom},</p>
       <p>Bonne nouvelle : votre compte Syndic360 a été approuvé. Vous pouvez dès à présent vous connecter et configurer vos résidences.</p>`
    ),
  });
}

export function sendAccountRejectedEmail(to: string, prenom: string) {
  return sendEmail({
    to,
    subject: "Syndic360 — Votre demande de compte n'a pas été approuvée",
    html: wrapper(
      "Compte non approuvé",
      `<p>Bonjour ${prenom},</p>
       <p>Votre demande de compte Syndic360 n'a pas été approuvée par notre équipe. Pour plus d'informations, contactez le support.</p>`
    ),
  });
}

export function sendResidentApprovedEmail(to: string, prenom: string, residenceNom: string) {
  return sendEmail({
    to,
    subject: "Syndic360 — Votre accès a été approuvé",
    html: wrapper(
      "Accès approuvé",
      `<p>Bonjour ${prenom},</p>
       <p>Votre accès à l'espace copropriétaire de la résidence <strong>${residenceNom}</strong> a été approuvé par votre syndic. Vous pouvez dès à présent vous connecter.</p>`
    ),
  });
}

export function sendResidentBlockedEmail(to: string, prenom: string, residenceNom: string) {
  return sendEmail({
    to,
    subject: "Syndic360 — Votre accès a été suspendu",
    html: wrapper(
      "Accès suspendu",
      `<p>Bonjour ${prenom},</p>
       <p>Votre accès à l'espace copropriétaire de la résidence <strong>${residenceNom}</strong> a été suspendu par votre syndic. Contactez-le pour plus d'informations.</p>`
    ),
  });
}
