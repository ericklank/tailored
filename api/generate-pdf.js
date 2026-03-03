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
  const items = (outcomes || []).filter(o => o.trim().length > 0);

  try {
    const doc = new PDFDocument({ size: "LETTER", margin: 43 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="teamtailor-proposal${prospectCompany ? `-${prospectCompany.toLowerCase().replace(/\s+/g, "-")}` : ""}.pdf"`);

    doc.pipe(res);

    const PAGE_HEIGHT = 792;
    const PAGE_WIDTH = 612;
    const LEFT = 43;
    const RIGHT = PAGE_WIDTH - 43;
    const CONTENT_WIDTH = RIGHT - LEFT;

    const HEADER_H = 60;
    const TABLE_HEADER_H = 30;
    const TABLE_ROW_H = 34;
    const SECTION_TITLE_H = 36;
    const DIVIDER_H = 14;
    const FOOTER_H = 90;
    const GAP_AFTER_TABLE = 16;

    const fixedUsed = HEADER_H + GAP_AFTER_TABLE + TABLE_HEADER_H + TABLE_ROW_H + SECTION_TITLE_H + DIVIDER_H + FOOTER_H;
    const availableForOutcomes = PAGE_HEIGHT - fixedUsed - 20;

    const count = items.length || 1;
    let fontSize = 11;
    const lineHeight = 1.6;

    for (let fs = 13; fs >= 8; fs -= 0.5) {
      const charsPerLine = Math.floor(CONTENT_WIDTH / (fs * 0.52));
      const totalLines = items.reduce((acc, o) => acc + Math.ceil(o.length / charsPerLine), 0);
      const totalH = totalLines * (fs * lineHeight) + count * 8;
      if (totalH <= availableForOutcomes) {
        fontSize = fs;
        break;
      }
    }

    const charsPerLine = Math.floor(CONTENT_WIDTH / (fontSize * 0.52));
    const totalLines = items.reduce((acc, o) => acc + Math.ceil(o.length / charsPerLine), 0);
    const textBlockH = totalLines * (fontSize * lineHeight);
    const remainingSpace = availableForOutcomes - textBlockH;
    const itemGap = Math.min(14, Math.max(4, remainingSpace / count));

    // ── HEADER ──────────────────────────────────────────────
    doc.rect(0, 0, PAGE_WIDTH, HEADER_H).fill(PINK);
    doc.font("Helvetica-Bold").fontSize(22).fillColor(WHITE)
      .text("Teamtailor", LEFT, 17);
    const headerRight = prospectCompany ? `${prospectCompany} — Teamtailor Proposal` : "Teamtailor Proposal";
    doc.font("Helvetica-Bold").fontSize(13).fillColor(WHITE)
      .text(headerRight, LEFT, 22, { align: "right", width: CONTENT_WIDTH });

    doc.y = HEADER_H + GAP_AFTER_TABLE;

    // ── PRICING TABLE ────────────────────────────────────────
    const tableTop = doc.y;
    const col1W = CONTENT_WIDTH * 0.65;
    const col2W = CONTENT_WIDTH * 0.35;

    doc.rect(LEFT, tableTop, CONTENT_WIDTH, TABLE_HEADER_H).fill(PINK);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(WHITE)
      .text("Product", LEFT + 10, tableTop + 10, { width: col1W });
    doc.font("Helvetica-Bold").fontSize(10).fillColor(WHITE)
      .text("Annual Recurring Fees", LEFT + col1W, tableTop + 10, { width: col2W - 10, align: "right" });

    const atsTop = tableTop + TABLE_HEADER_H;
    doc.rect(LEFT, atsTop, CONTENT_WIDTH, TABLE_ROW_H).fill(PINK_PALE);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK)
      .text("Applicant Tracking System", LEFT + 10, atsTop + 12, { width: col1W });
    if (listPrice) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK)
        .text(listPrice, LEFT + col1W, atsTop + 12, { width: col2W - 10, align: "right" });
    }

    doc.y = atsTop + TABLE_ROW_H + 18;

    // ── BENEFITS TITLE ────────────────────────────────────────
    const benefitsTitle = prospectCompany
      ? `Benefits ${prospectCompany} will unlock with Teamtailor`
      : "Benefits you will unlock with Teamtailor";
    doc.font("Helvetica-Bold").fontSize(13).fillColor(DARK)
      .text(benefitsTitle, LEFT, doc.y, { width: CONTENT_WIDTH });
    doc.y += 8;
    doc.moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).strokeColor(BORDER).lineWidth(1).stroke();
    doc.y += 10;

    // ── OUTCOMES ─────────────────────────────────────────────
    for (const outcome of items) {
      const dash = outcome.indexOf(" — ");
      const feature = dash > -1 ? outcome.slice(0, dash) : outcome;
      const desc = dash > -1 ? outcome.slice(dash) : "";

      const bulletY = doc.y;
      doc.circle(LEFT + 4, bulletY + fontSize * 0.45, 3).fill(PINK);

      doc.font("Helvetica-Bold").fontSize(fontSize).fillColor(PINK)
        .text(feature, LEFT + 12, bulletY, { continued: desc.length > 0, width: CONTENT_WIDTH - 12 });
      if (desc) {
        doc.font("Helvetica").fontSize(fontSize).fillColor(DARK)
          .text(desc, { width: CONTENT_WIDTH - 12 });
      }
      doc.y += itemGap;
    }

    // ── FOOTER (pinned to bottom) ─────────────────────────────
    const footerY = PAGE_HEIGHT - FOOTER_H + 5;
    doc.moveTo(LEFT, footerY).lineTo(RIGHT, footerY).strokeColor(BORDER).lineWidth(1).stroke();
    doc.font("Helvetica").fontSize(9).fillColor(GRAY)
      .text("If you have any questions, do let me know.", LEFT, footerY + 10);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK).text("Eric Klank", LEFT, footerY + 24);
    doc.font("Helvetica").fontSize(9).fillColor(GRAY).text("Teamtailor — Chicago", LEFT, footerY + 36);
    doc.font("Helvetica").fontSize(9).fillColor(PINK).text("eric.klank@teamtailor.com", LEFT, footerY + 48);
    doc.font("Helvetica").fontSize(9).fillColor(PINK).text("(815) 482-5699", LEFT, footerY + 60);

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err.message });
  }
}
