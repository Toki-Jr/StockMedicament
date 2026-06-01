const PDFDocument = require("pdfkit");
const path        = require("path");
const fs          = require("fs");

const OUTPUT_DIR = path.join(__dirname, "../factures");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Génère une facture PDF de vente (sortie).
 * @param {Object} data
 * @param {string} data.nomClient
 * @param {string} data.emailClient
 * @param {string} data.nomPharmacien
 * @param {string} data.typeMvt          
 * @param {string} [data.motif]          
 * @param {Array}  data.medicaments      
 * @returns {Promise<{ filePath, fileName, numeroFacture, totalGeneral }>}
 */
function genererFacture(data) {
  return new Promise((resolve, reject) => {
    const {
      nomClient,
      emailClient = "",
      nomPharmacien,
      typeMvt     = "sortie",
      motif       = "",
      medicaments = [],
    } = data;

    if (!nomClient || !nomPharmacien || medicaments.length === 0) {
      return reject(new Error("Données manquantes (client, pharmacien ou médicaments)"));
    }

    const now      = new Date();
    const dateStr  = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Indian/Antananarivo" });
    const heureStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Indian/Antananarivo" });
    
    const numeroFacture = `FAC-${Date.now()}`;
    const fileName      = `facture_${numeroFacture}.pdf`;
    const filePath      = path.join(OUTPUT_DIR, fileName);

    const doc    = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const VERT = "#1a7a4a";
    const GRIS = "#f5f5f5";
    const BORD = "#dddddd";
    const NOIR = "#222222";

    // ── En-tête ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(VERT);
    doc.fillColor("#fff").fontSize(22).font("Helvetica-Bold").text("PHARMACIE CENTRALE", 50, 25);
    doc.fontSize(10).font("Helvetica").text("Votre sante, notre priorite", 50, 52);
    doc.fontSize(9)
       .text(`N Facture : ${numeroFacture}`, 400, 25, { align: "right" })
       .text(`Date : ${dateStr}`,            400, 40, { align: "right" })
       .text(`Heure : ${heureStr}`,          400, 55, { align: "right" })

    // ── Infos client & pharmacien ─────────────────────────────────────────
    const infoY = 115;
    doc.fillColor(VERT).fontSize(11).font("Helvetica-Bold").text("CLIENT", 50, infoY);
    doc.fillColor(NOIR).fontSize(10).font("Helvetica").text(nomClient, 50, infoY + 16);
    if (emailClient) {
      doc.fillColor("#555").fontSize(9).text(emailClient, 50, infoY + 30);
    }

    doc.fillColor(VERT).fontSize(11).font("Helvetica-Bold").text("PHARMACIEN", 350, infoY);
    doc.fillColor(NOIR).fontSize(10).font("Helvetica").text(nomPharmacien, 350, infoY + 16);

    // Motif si présent
    if (motif) {
      doc.fillColor("#777").fontSize(9).font("Helvetica-Oblique")
         .text(`Motif : ${motif}`, 50, infoY + 48);
    }

    doc.moveTo(50, infoY + 62).lineTo(545, infoY + 62).strokeColor(BORD).lineWidth(1).stroke();

    // ── Tableau médicaments ───────────────────────────────────────────────
    const tableTop = infoY + 78;
    const colNom   = 50, colQte = 310, colPU = 380, colTot = 460;

    doc.rect(50, tableTop, 495, 22).fill(VERT);
    doc.fillColor("#fff").fontSize(10).font("Helvetica-Bold")
       .text("Médicament",  colNom + 5,  tableTop + 6)
       .text("Quantité",         colQte + 5,  tableTop + 6)
       .text("Prix unitaire",  colPU  + 5,  tableTop + 6)
       .text("Total",       colTot + 5,  tableTop + 6);

    let y = tableTop + 22;
    let totalGeneral = 0;

    medicaments.forEach((med, i) => {
      const pu        = parseFloat(med.prixUnitaire) || 0;
      const qty       = parseInt(med.quantite, 10)   || 1;
      const sousTotal = pu * qty;
      totalGeneral   += sousTotal;

      doc.rect(50, y, 495, 22).fill(i % 2 === 0 ? "#fff" : GRIS);
      doc.fillColor(NOIR).fontSize(10).font("Helvetica")
         .text(med.nom || "-",                colNom + 5,  y + 6, { width: 250 })
         .text(String(qty),                   colQte + 5,  y + 6)
         .text(`${pu.toFixed(2)} Ar`,         colPU  + 5,  y + 6)
         .text(`${sousTotal.toFixed(2)} Ar`,  colTot + 5,  y + 6);
      y += 22;
    });

    doc.rect(50, tableTop, 495, y - tableTop).strokeColor(BORD).lineWidth(0.5).stroke();

    // ── Total ─────────────────────────────────────────────────────────────
    y += 10;
    doc.rect(350, y, 195, 28).fill(VERT);
    doc.fillColor("#fff").fontSize(12).font("Helvetica-Bold")
       .text("TOTAL A PAYER :", 355, y + 8)
       .text(`${totalGeneral.toFixed(2)} Ar`, 460, y + 8);

    // ── Badge mouvement type ──────────────────────────────────────────────
    y += 40;
    doc.rect(50, y, 200, 20).fill("#e8f5e9");
    doc.fillColor(VERT).fontSize(9).font("Helvetica-Bold")
       .text("MOUVEMENT : SORTIE / VENTE CLIENT", 55, y + 5);

    // ── Badge email si présent ────────────────────────────────────────────
    if (emailClient) {
      y += 26;
      doc.rect(50, y, 340, 20).fill("#e3f2fd");
      doc.fillColor("#1565c0").fontSize(9).font("Helvetica")
         .text(`Facture envoyee automatiquement a : ${emailClient}`, 55, y + 5);
    }

    // ── Pied de page ──────────────────────────────────────────────────────
    const footerY = doc.page.height - 60;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(BORD).lineWidth(0.5).stroke();
    doc.fillColor("#888").fontSize(8).font("Helvetica")
       .text("Merci de votre confiance - Pharmacie Centrale", 50, footerY + 10, { align: "center", width: 495 })
       .text("Conserver cette facture comme preuve d'achat",  50, footerY + 22, { align: "center", width: 495 });

    doc.end();
    stream.on("finish", () => resolve({ filePath, fileName, numeroFacture, totalGeneral }));
    stream.on("error",  reject);
  });
}

module.exports = { genererFacture };