import PDFDocument from "pdfkit";

const PINK = "#FF2D78";
const PINK_PALE = "#FFF0F5";
const DARK = "#1A1A2E";
const GRAY = "#7A7A9A";
const BORDER = "#EDE8F2";
const WHITE = "#FFFFFF";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prospectCompany, listPrice, outcomes, repName } = req.body;
  const items = (outcomes || []).filter(o => o.trim().length > 0);

  try {
    const doc = new PDFDocument({ size: "LETTER", margin: 0, autoFirstPage: true });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="teamtailor-proposal${prospectCompany ? `-${prospectCompany.toLowerCase().replace(/\s+/g, "-")}` : ""}.pdf"`);

    doc.pipe(res);

    const PAGE_H = 792;
    const PAGE_W = 612;
    const LEFT = 43;
    const RIGHT = PAGE_W - 43;
    const CW = RIGHT - LEFT;

    const HEADER_H = 60;
    const GAP1 = 16;
    const TABLE_HDR_H = 30;
    const TABLE_ROW_H = 34;
    const GAP2 = 18;
    const BENEFITS_TITLE_H = 20;
    const GAP3 = 18;
    const FOOTER_H = 88;
    const FOOTER_TOP_GAP = 16;

    const fixedH = HEADER_H + GAP1 + TABLE_HDR_H + TABLE_ROW_H + GAP2 + BENEFITS_TITLE_H + GAP3 + FOOTER_TOP_GAP + FOOTER_H;
    const availableH = PAGE_H - fixedH;

    let chosenFs = 10;
    let chosenGap = 8;

    for (let fs = 13; fs >= 7.5; fs -= 0.25) {
      const lh = fs * 1.5;
      const cpl = Math.floor(CW / (fs * 0.52));
      const totalLines = items.reduce((acc, o) => acc + Math.ceil(o.length / cpl), 0);
      const textH = totalLines * lh;
      const leftover = availableH - textH;
      const gap = leftover / items.length;
      if (gap >= 6 && gap <= 20) {
        chosenFs = fs;
        chosenGap = gap;
        break;
      }
      if (gap > 20 && fs <= 7.5) {
        chosenFs = fs;
        chosenGap = Math.min(20, gap);
        break;
      }
    }

    // ── HEADER ──────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, HEADER_H).fill(PINK);
    doc.font("Helvetica-Bold").fontSize(22).fillColor(WHITE).text("Teamtailor", LEFT, 17);
    const headerRight = prospectCompany ? `${prospectCompany} — Teamtailor Proposal` : "Teamtailor Proposal";
    doc.font("Helvetica-Bold").fontSize(13).fillColor(WHITE)
      .text(headerRight, LEFT, 22, { align: "right", width: CW });

    let y = HEADER_H + GAP1;

    // ── PRICING TABLE ────────────────────────────────────────
    const col1W = CW * 0.65;
    const col2W = CW * 0.35;

    doc.rect(LEFT, y, CW, TABLE_HDR_H).fill(PINK);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(WHITE)
      .text("Product", LEFT + 10, y + 10, { width: col1W });
    doc.font("Helvetica-Bold").fontSize(10).fillColor(WHITE)
      .text("Annual Recurring Fees", LEFT + col1W, y + 10, { width: col2W - 10, align: "right" });

    y += TABLE_HDR_H;
    doc.rect(LEFT, y, CW, TABLE_ROW_H).fill(PINK_PALE);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK)
      .text("Applicant Tracking System", LEFT + 10, y + 12, { width: col1W });
    if (listPrice) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK)
        .text(listPrice, LEFT + col1W, y + 12, { width: col2W - 10, align: "right" });
    }

    y += TABLE_ROW_H + GAP2;

    // ── BENEFITS TITLE + DIVIDER ──────────────────────────────
    const benefitsTitle = prospectCompany
      ? `Benefits ${prospectCompany} will unlock with Teamtailor`
      : "Benefits you will unlock with Teamtailor";
    doc.font("Helvetica-Bold").fontSize(13).fillColor(DARK).text(benefitsTitle, LEFT, y, { width: CW });
    y += BENEFITS_TITLE_H;
    doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor(BORDER).lineWidth(1).stroke();
    y += 8;

    // ── OUTCOMES ─────────────────────────────────────────────
    for (const outcome of items) {
      const dash = outcome.indexOf(" — ");
      const feature = dash > -1 ? outcome.slice(0, dash) : outcome;
      const desc = dash > -1 ? outcome.slice(dash) : "";

      doc.circle(LEFT + 4, y + chosenFs * 0.5, 3).fill(PINK);

      doc.font("Helvetica-Bold").fontSize(chosenFs).fillColor(PINK)
        .text(feature, LEFT + 12, y, { continued: desc.length > 0, width: CW - 12 });
      if (desc) {
        doc.font("Helvetica").fontSize(chosenFs).fillColor(DARK)
          .text(desc, { width: CW - 12 });
      }
      y = doc.y + chosenGap;
    }

    // ── FOOTER (absolutely pinned to bottom) ──────────────────
    const footerY = PAGE_H - FOOTER_H;
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
