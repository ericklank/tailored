// api/generate-pdf.js - Generate proposal PDF using pdfkit
import PDFDocument from "pdfkit";

const PINK = "#FF2D78";
const PINK_PALE = "#FFF0F5";
const DARK = "#1A1A2E";
const GRAY = "#7A7A9A";
const BORDER = "#EDE8F2";
const WHITE = "#FFFFFF";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prospectCompany, prospectName, listPrice, outcomes } = req.body;

  try {
    const doc = new PDFDocument({ size: "LETTER", margin: 43 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="teamtailor-proposal${prospectCompany ? `-${prospectCompany.toLowerCase().replace(/\s+/g, "-")}` : ""}.pdf"`);

    doc.pipe(res);

    const pageWidth = 612 - 86; // letter width minus margins
    const LEFT = 43;
    const RIGHT = 569;

    // ── HEADER ──────────────────────────────────────────────
    doc.rect(LEFT - 43, 0, 612, 60).fill(PINK);

    doc.font("Helvetica-Bold").fontSize(20).fillColor(WHITE)
      .text("Teamtailor", LEFT, 19);

    const headerRight = prospectCompany
      ? `${prospectCompany} — Teamtailor Proposal`
      : "Teamtailor Proposal";
    doc.font("Helvetica-Bold").fontSize(12).fillColor(WHITE)
      .text(headerRight, LEFT, 22, { align: "right", width: pageWidth });

    doc.y = 80;

    // ── PRICING TABLE ────────────────────────────────────────
    const tableTop = doc.y;
    const col1W = pageWidth * 0.65;
    const col2W = pageWidth * 0.35;

    // Header row
    doc.rect(LEFT, tableTop, pageWidth, 30).fill(PINK);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(WHITE)
      .text("Product", LEFT + 10, tableTop + 10, { width: col1W })
      .text("Annual Recurring Fees", LEFT + col1W, tableTop + 10, { width: col2W, align: "right" });

    // ATS row
    const atsTop = tableTop + 30;
    doc.rect(LEFT, atsTop, pageWidth, 30).fill(PINK_PALE).stroke(BORDER);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK)
      .text("Applicant Tracking System", LEFT + 10, atsTop + 10, { width: col1W });
    if (listPrice) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK)
        .text(listPrice, LEFT + col1W, atsTop + 10, { width: col2W - 10, align: "right" });
    }

    doc.y = atsTop + 44;

    // ── BENEFITS ─────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(12).fillColor(DARK)
      .text(
        prospectCompany
          ? `Benefits ${prospectCompany} will unlock with Teamtailor`
          : "Benefits you will unlock with Teamtailor",
        LEFT, doc.y, { width: pageWidth }
      );

    doc.y += 6;
    doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
    doc.y += 10;

    for (const outcome of (outcomes || [])) {
      const dash = outcome.indexOf(" — ");
      let feature = outcome;
      let desc = "";
      if (dash > -1) {
        feature = outcome.slice(0, dash);
        desc = outcome.slice(dash);
      }

      const bulletY = doc.y;
      // Pink bullet dot
      doc.circle(LEFT + 4, bulletY + 5, 3).fill(PINK);

      // Feature name in pink bold, rest in normal
      doc.font("Helvetica-Bold").fontSize(10).fillColor(PINK)
        .text(feature, LEFT + 12, bulletY, { continued: desc.length > 0, width: pageWidth - 12 });
      if (desc) {
        doc.font("Helvetica").fontSize(10).fillColor(DARK)
          .text(desc, { width: pageWidth - 12 });
      }
      doc.y += 4;
    }

    // ── FOOTER ───────────────────────────────────────────────
    doc.y += 10;
    doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
    doc.y += 10;

    doc.font("Helvetica").fontSize(9).fillColor(GRAY)
      .text("If you have any questions, do let me know.", LEFT, doc.y);
    doc.y += 14;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK).text("Eric Klank", LEFT);
    doc.y += 2;
    doc.font("Helvetica").fontSize(9).fillColor(GRAY).text("Teamtailor — Chicago", LEFT);
    doc.y += 2;
    doc.font("Helvetica").fontSize(9).fillColor(PINK).text("eric.klank@teamtailor.com", LEFT);
    doc.y += 2;
    doc.font("Helvetica").fontSize(9).fillColor(PINK).text("(815) 482-5699", LEFT);

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err.message });
  }
}
