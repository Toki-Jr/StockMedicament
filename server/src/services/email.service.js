const nodemailer = require("nodemailer");
const fs         = require("fs");

/**
 * Crée le transporteur SMTP.
 * Les variables d'environnement SMTP_* sont lues depuis .env (via dotenv dans server.js).
 */
function creerTransporteur() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || "smtp.gmail.com",
    port:   parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true pour port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Envoie la facture PDF par email au client.
 * @param {Object} options
 * @param {string} options.emailClient    
 * @param {string} options.nomClient      
 * @param {string} options.nomPharmacien  
 * @param {string} options.numeroFacture  
 * @param {number} options.totalGeneral   
 * @param {string} options.pdfPath        
 * @returns {Promise<Object>}            
 */
async function envoyerFactureParEmail(options) {
  const { emailClient, nomClient, nomPharmacien, numeroFacture, totalGeneral, pdfPath } = options;

  if (!emailClient) throw new Error("Email du client manquant.");
  if (!fs.existsSync(pdfPath)) throw new Error("Fichier PDF introuvable : " + pdfPath);

  const transporteur = creerTransporteur();

  // Vérification de la connexion SMTP avant envoi
  await transporteur.verify();

  const mailOptions = {
    from: `"Pharmacie Centrale" <${process.env.SMTP_USER}>`,
    to:   emailClient,
    subject: `Votre facture ${numeroFacture} — Pharmacie Centrale`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <!-- En-tête -->
        <div style="background:#1a7a4a;padding:24px 30px;color:#fff;">
          <h2 style="margin:0;font-size:20px;">💊 Pharmacie Centrale</h2>
          <p style="margin:6px 0 0;font-size:13px;opacity:.85;">Votre santé, notre priorité</p>
        </div>

        <!-- Corps -->
        <div style="padding:28px 30px;color:#333;">
          <p style="font-size:15px;">Bonjour <strong>${nomClient}</strong>,</p>
          <p style="font-size:14px;line-height:1.6;">
            Merci pour votre achat à la Pharmacie Centrale.<br/>
            Veuillez trouver en pièce jointe votre facture <strong>${numeroFacture}</strong>
            établie par <strong>${nomPharmacien}</strong>.
          </p>

          <!-- Résumé -->
          <div style="background:#f5f5f5;border-left:4px solid #1a7a4a;padding:14px 18px;border-radius:4px;margin:20px 0;">
            <p style="margin:0;font-size:13px;color:#555;">Numéro de facture</p>
            <p style="margin:4px 0 12px;font-size:16px;font-weight:bold;color:#1a7a4a;">${numeroFacture}</p>
            <p style="margin:0;font-size:13px;color:#555;">Montant total</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#222;">${totalGeneral.toFixed(2)} Ar</p>
          </div>

          <p style="font-size:13px;color:#666;line-height:1.6;">
            La facture PDF est jointe à cet email. Conservez-la comme preuve d'achat.
          </p>

          <p style="font-size:14px;margin-top:24px;">
            Cordialement,<br/>
            <strong>${nomPharmacien}</strong><br/>
            <span style="color:#1a7a4a;">Pharmacie Centrale</span>
          </p>
        </div>

        <!-- Pied de page -->
        <div style="background:#f9f9f9;padding:14px 30px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;">
          Cet email a été envoyé automatiquement — Merci de ne pas y répondre directement.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `facture_${numeroFacture}.pdf`,
        path:     pdfPath,
        contentType: "application/pdf",
      },
    ],
  };

  const info = await transporteur.sendMail(mailOptions);
  console.log(`[EmailService] Facture ${numeroFacture} envoyée à ${emailClient} — ID: ${info.messageId}`);
  return info;
}

module.exports = { envoyerFactureParEmail };