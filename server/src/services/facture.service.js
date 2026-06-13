const PDFDocument = require("pdfkit");
const path        = require("path");
const fs          = require("fs");

const OUTPUT_DIR = path.join(__dirname, "../factures");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Montant en lettres (sans dépendance externe) ──────────────────────────────
function montantEnLettres(n) {
  const unites  = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
                   "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
                   "dix-sept", "dix-huit", "dix-neuf"];
  const dizaines = ["", "", "vingt", "trente", "quarante", "cinquante",
                    "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

  function centaines(n) {
    if (n === 0) return "";
    if (n < 20)  return unites[n];
    const d = Math.floor(n / 10);
    const u = n % 10;
    if (d === 7) return "soixante-" + unites[10 + u];
    if (d === 9) return "quatre-vingt-" + (u ? unites[u] : "");
    if (d === 8) return u ? "quatre-vingt-" + unites[u] : "quatre-vingts";
    return dizaines[d] + (u === 1 && d !== 8 ? "-et-" : u ? "-" : "") + unites[u];
  }

  function groupe(n) {
    if (n === 0) return "";
    if (n < 100) return centaines(n);
    const c = Math.floor(n / 100);
    const r = n % 100;
    const pfx = c === 1 ? "cent" : unites[c] + " cent";
    if (r === 0) return c === 1 ? "cent" : unites[c] + " cents";
    return pfx + " " + centaines(r);
  }

  const entier = Math.round(n);
  if (entier === 0) return "zéro ariary";

  const milliards = Math.floor(entier / 1_000_000_000);
  const millions  = Math.floor((entier % 1_000_000_000) / 1_000_000);
  const milliers  = Math.floor((entier % 1_000_000) / 1_000);
  const reste     = entier % 1_000;

  let result = "";
  if (milliards) result += groupe(milliards) + " milliard" + (milliards > 1 ? "s" : "") + " ";
  if (millions)  result += groupe(millions)  + " million"  + (millions  > 1 ? "s" : "") + " ";
  if (milliers)  result += (milliers === 1 ? "mille" : groupe(milliers) + " mille") + " ";
  if (reste)     result += groupe(reste);

  return result.trim() + " ariary";
}

// ── Générateur PDF ────────────────────────────────────────────────────────────
function genererFacture(data) {
  return new Promise((resolve, reject) => {
    const {
      nomClient,
      emailClient   = "",
      nomPharmacien,
      typeMvt       = "sortie",
      motif         = "",
      medicaments   = [],
    } = data;

    if (!nomClient || !nomPharmacien || medicaments.length === 0) {
      return reject(new Error("Données manquantes (client, pharmacien ou médicaments)"));
    }

    const now      = new Date();
    const dateStr  = now.toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
      timeZone: "Indian/Antananarivo",
    });
    const heureStr = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit",
      timeZone: "Indian/Antananarivo",
    });

    const pad    = (n) => String(n).padStart(2, "0");
    const numRef = `FAC-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${String(Date.now()).slice(-4)}`;
    const fileName = `facture_${numRef}.pdf`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    const doc    = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const VERT  = "#1a7a4a";
    const VERT2 = "#e8f5e9";
    const GRIS  = "#f8f8f8";
    const BORD  = "#dddddd";
    const NOIR  = "#222222";
    const GRIS2 = "#666666";
    const W     = doc.page.width;

    // ── En-tête ──────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 85).fill(VERT);

    doc.fillColor("#fff").fontSize(20).font("Helvetica-Bold")
       .text("Pharmacie Centrale", 50, 20);
    doc.fontSize(9).font("Helvetica")
       .text("123 Avenue de la République, Antananarivo 101", 50, 45)
       .text("Tél : +261 20 22 123 45  |  contact@pharmacie-centrale.mg", 50, 58)
       .text("NIF : 1234567  —  STAT : 52100 11 2010 0 00123", 50, 71);

    doc.fillColor("#fff").fontSize(26).font("Helvetica-Bold")
       .text("FACTURE", 390, 22, { align: "right", width: 155 });
    doc.fontSize(9).font("Helvetica")
       .text(`N° ${numRef}`,           390, 54, { align: "right", width: 155 })
       .text(`${dateStr}  ${heureStr}`, 390, 67, { align: "right", width: 155 });

    // ── Blocs client / pharmacien / référence ─────────────────────────────
    const blockY = 105;
    const blockH = 72;

    const blocks = [
      {
        x: 50, label: "Facturé à",
        lines: [
          { text: nomClient, bold: true },
          ...(emailClient ? [{ text: emailClient, color: GRIS2 }] : []),
        ],
      },
      {
        x: 215, label: "Dispensé par",
        lines: [
          { text: nomPharmacien, bold: true },
          { text: "Pharmacien titulaire", color: GRIS2 },
        ],
      },
      {
        x: 390, label: "Référence",
        lines: [
          { text: "Vente directe", bold: true },
          { text: "Mode de paiement: en Espèce", color: GRIS2 },
        ],
      },
    ];

    blocks.forEach(b => {
      doc.rect(b.x, blockY, 155, blockH).fill(GRIS).strokeColor(BORD).lineWidth(0.5).stroke();
      doc.fillColor(VERT).fontSize(8).font("Helvetica-Bold")
         .text(b.label.toUpperCase(), b.x + 8, blockY + 8);
      let lineY = blockY + 22;
      b.lines.forEach(l => {
        doc.fillColor(l.color || NOIR)
           .fontSize(9)
           .font(l.bold ? "Helvetica-Bold" : "Helvetica")
           .text(l.text, b.x + 8, lineY, { width: 139 });
        lineY += 14;
      });
    });

    // ── Tableau médicaments ───────────────────────────────────────────────
    const tableTop = blockY + blockH + 20;
    const cols     = { nom: 50, qte: 320, pu: 390, total: 470 };
    const colW     = 495;

    doc.rect(50, tableTop, colW, 24).fill(VERT);
    doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold")
       .text("Désignation",      cols.nom   + 6, tableTop + 7)
       .text("Quantité",              cols.qte   + 6, tableTop + 7)
       .text("Prix unitaire (Ar)",  cols.pu    + 6, tableTop + 7)
       .text("Total (Ar)",       cols.total + 6, tableTop + 7);

    let y = tableTop + 24;
    let totalGeneral = 0;

    medicaments.forEach((med, i) => {
      const pu        = parseFloat(med.prixUnitaire) || 0;
      const qty       = parseInt(med.quantite, 10)   || 1;
      const sousTotal = pu * qty;
      totalGeneral   += sousTotal;

      const rowH = 24;
      doc.rect(50, y, colW, rowH).fill(i % 2 === 0 ? "#fff" : GRIS).strokeColor(BORD).lineWidth(0.5).stroke();
      doc.fillColor(NOIR).fontSize(9).font("Helvetica")
         .text(med.nom || "—",                      cols.nom   + 6, y + 7, { width: 260 })
         .text(String(qty),                         cols.qte   + 6, y + 7)
         .text(pu.toLocaleString("fr-FR"),           cols.pu    + 6, y + 7)
         .text(sousTotal.toLocaleString("fr-FR"),    cols.total + 6, y + 7);
      y += rowH;
    });

    doc.rect(50, tableTop, colW, y - tableTop).strokeColor(BORD).lineWidth(0.5).stroke();

    // ── Exonération TVA + Total ───────────────────────────────────────────
    y += 12;
    
    doc.rect(350, y, 195, 28).fill(VERT);
    doc.fillColor("#fff").fontSize(10).font("Helvetica-Bold")
       .text("TOTAL À PAYER", 356, y + 5)
       .text(`${totalGeneral.toLocaleString("fr-FR")} Ar`, 356, y + 16, { width: 183, align: "right" });

    // ── Montant en lettres ────────────────────────────────────────────────
    y += 40;
    doc.fillColor(NOIR).fontSize(9).font("Helvetica-Bold")
       .text("Arrêté le présent mémoire à la somme de :", 50, y);
    y += 14;
    doc.fillColor(VERT).fontSize(10).font("Helvetica-Bold")
       .text(montantEnLettres(totalGeneral).toUpperCase(), 50, y, { width: 495 });

    // On force la signature à ne pas dépasser une zone sûre
    const signatureY = Math.min(y + 38, doc.page.height - 130);

    doc.moveTo(50, signatureY).lineTo(545, signatureY).strokeColor(BORD).lineWidth(0.5).stroke();

    doc.fillColor(GRIS2).fontSize(9).font("Helvetica")
       .text("Le Pharmacien,", 390, signatureY + 10);

    doc.moveTo(370, signatureY + 55).lineTo(545, signatureY + 55).strokeColor(NOIR).lineWidth(0.5).stroke();
    doc.fillColor(NOIR).fontSize(9).font("Helvetica-Bold")
       .text(nomPharmacien, 370, signatureY + 61);

    // ── Pied de page — toujours ancré en bas ─────────────────────────────
    const footerY = doc.page.height - 55;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(BORD).lineWidth(0.5).stroke();
    doc.fillColor(GRIS2).fontSize(8).font("Helvetica")
       .text("Membre de l'Ordre National des Pharmaciens de Madagascar", 50, footerY + 8,  { align: "center", width: 495 })
       .text("Ce document tient lieu de reçu officiel — Conservez-le comme preuve d'achat.", 50, footerY + 20, { align: "center", width: 495 })
       .text("Merci de votre confiance.", 50, footerY + 32, { align: "center", width: 495 });

    doc.end();
  });
}

module.exports = { genererFacture };