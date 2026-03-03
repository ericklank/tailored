import { useState, useCallback } from "react";

const SECTIONS = [
  { key: "currentSituation", label: "Current Situation", color: "#FF2D78", span: 1 },
  { key: "positiveOutcomes", label: "Discussed in Call", color: "#00C896", span: 1 },
  { key: "suggestedOutcomes", label: "You Might Have Missed", color: "#FF8C42", span: 1, badge: "💡 AI Suggested" },
  { key: "objectionsRaised", label: "Objections Raised", color: "#E0294A", span: 1 },
  { key: "recommendedNextSteps", label: "Recommended Next Steps", color: "#6C63FF", span: 2 },
  { key: "coachingNotes", label: "Coaching", color: "#0EA5E9", span: 2, badge: "🎯 Rep Coaching", coaching: true },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  :root {
    --pink: #FF2D78; --pink-light: #FF6BA8; --pink-pale: #FFF0F5;
    --pink-muted: rgba(255,45,120,0.08); --pink-border: rgba(255,45,120,0.2);
    --text: #1A1A2E; --text-muted: #7A7A9A; --bg: #FFFFFF;
    --surface: #F8F6FA; --border: #EDE8F2;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 64px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px); z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
  .logo-dot {
    width: 30px; height: 30px; background: linear-gradient(135deg, #FF2D78, #FF6BA8);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; font-weight: 800;
  }
  .tagline { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); }
  .main { flex: 1; max-width: 960px; margin: 0 auto; padding: 48px 24px 80px; width: 100%; }
  .page-title { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; color: var(--text); }
  .page-sub { font-size: 15px; color: var(--text-muted); margin-bottom: 36px; }
  .upload-zone {
    border: 2px dashed var(--pink-border); border-radius: 16px; background: var(--pink-pale);
    padding: 48px; text-align: center; cursor: pointer; transition: all 0.2s;
    position: relative; margin-bottom: 20px;
  }
  .upload-zone:hover, .upload-zone.drag-over { border-color: var(--pink); background: rgba(255,45,120,0.06); }
  .file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .upload-icon { font-size: 36px; margin-bottom: 12px; display: block; }
  .upload-title { font-size: 18px; font-weight: 600; margin-bottom: 6px; color: var(--text); }
  .upload-sub { font-size: 13px; color: var(--text-muted); }
  .upload-sub strong { color: var(--pink); }
  .file-selected {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 12px; margin-bottom: 20px;
  }
  .file-name { font-size: 14px; font-weight: 500; color: var(--pink); }
  .file-size { font-size: 12px; color: var(--text-muted); }
  .api-input {
    flex: 1; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text);
    background: var(--surface); outline: none; transition: border-color 0.2s;
  }
  .api-input:focus { border-color: var(--pink); }
  .analyze-btn {
    width: 100%; padding: 16px; background: linear-gradient(135deg, #FF2D78, #FF6BA8);
    color: white; border: none; border-radius: 14px; font-family: 'DM Sans', sans-serif;
    font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; letter-spacing: 0.2px;
  }
  .analyze-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .error-box {
    padding: 12px 16px; background: #FFF0F0; border: 1.5px solid #FFCDD2;
    border-radius: 10px; font-size: 13px; color: #D32F2F; margin-bottom: 16px;
  }
  .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 16px; }
  .loading-ring {
    width: 44px; height: 44px; border: 3px solid var(--border);
    border-top-color: var(--pink); border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 18px; font-weight: 600; color: var(--text); }
  .loading-sub { font-size: 13px; color: var(--text-muted); }
  .results { width: 100%; }
  .results-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 28px; }
  .results-title { font-size: 28px; font-weight: 700; letter-spacing: -0.4px; color: var(--text); }
  .results-file { font-size: 13px; color: var(--text-muted); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
  .section-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 24px; }
  .section-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
    padding-bottom: 14px; border-bottom: 1px solid var(--border);
  }
  .section-pip { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); }
  .section-items { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .section-item {
    font-size: 13.5px; line-height: 1.55; color: var(--text);
    padding-left: 14px; position: relative; display: flex; flex-direction: column; gap: 4px;
  }
  .section-item::before {
    content: ''; position: absolute; left: 0; top: 8px;
    width: 5px; height: 5px; border-radius: 50%; background: var(--border);
  }
  .reset-btn {
    background: none; border: 1.5px solid var(--border); border-radius: 10px;
    padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px;
    font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; margin-bottom: 40px;
  }
  .reset-btn:hover { border-color: var(--pink); color: var(--pink); }
  .coaching-card { background: #F0F9FF; border: 1.5px solid #BAE6FD; border-radius: 16px; padding: 24px; }
  .coaching-item { font-size: 13.5px; line-height: 1.6; color: var(--text); padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; background: white; border: 1px solid #E0F2FE; }
  .coaching-item:last-child { margin-bottom: 0; }
  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; }
    .header { padding: 0 20px; }
    .main { padding: 32px 16px 60px; }
  }
`;

export default function App() {
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState("");
  const [context, setContext] = useState({
  repName: "",
  repEmail: "",
  repPhone: "",
  prospectTitle: "",
  currentAts: "",
  renewalDate: "",
  dealNotes: "",
});
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");
  const [importing, setImporting] = useState(false);
  const [importingStories, setImportingStories] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleLogin = async () => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, messages: [{ role: "user", content: "hi" }], system: "Say ok" }),
    });
    if (res.status === 401) {
      setAuthError("Incorrect password, try again.");
    } else {
      setAuthed(true);
      setAuthError("");
    }
  };

  const getPricingText = (employeeCount) => {
    if (!employeeCount || employeeCount === 0) return null;
    const count = parseInt(employeeCount);
    let tier, price;
    if (count <= 5) { tier = "1–5"; price = "$1,250"; }
    else if (count <= 25) { tier = "6–25"; price = "$3,025"; }
    else if (count <= 50) { tier = "26–50"; price = "$4,125"; }
    else if (count <= 75) { tier = "51–75"; price = "$6,000"; }
    else if (count <= 100) { tier = "76–100"; price = "$8,000"; }
    else if (count <= 150) { tier = "101–150"; price = "$9,000"; }
    else if (count <= 250) { tier = "151–250"; price = "$10,500"; }
    else if (count <= 400) { tier = "251–400"; price = "$12,000"; }
    else if (count <= 600) { tier = "401–600"; price = "$13,000"; }
    else if (count <= 800) { tier = "601–800"; price = "$15,000"; }
    else if (count <= 1000) { tier = "801–1,000"; price = "$19,000"; }
    else if (count <= 1500) { tier = "1,000–1,500"; price = "$23,000"; }
    else if (count <= 2000) { tier = "1,500–2,000"; price = "$28,000"; }
    else if (count <= 3000) { tier = "2,000–3,000"; price = "$33,000"; }
    else if (count <= 4000) { tier = "3,000–4,000"; price = "$40,000"; }
    else if (count <= 5000) { tier = "4,000–5,000"; price = "$50,000"; }
    else { tier = "5,000+"; price = "POA"; }
    return { tier, price };
  };

  const copyEmail = () => {
    const name = results?.prospectName || "there";
    const pricing = getPricingText(results?.employeeCount);
    const outcomeItems = (results?.positiveOutcomes || []).map(item => {
      const text = item.outcome || item;
      const url = item.article?.url;
      const dashIdx = text.indexOf(" — ");
      const featureName = dashIdx > -1 ? text.slice(0, dashIdx) : text;
      const rest = dashIdx > -1 ? text.slice(dashIdx) : "";
      return `<li style="margin-bottom:8px">${url ? `<a href="${url}">${featureName}</a>${rest}` : `<strong>${featureName}</strong>${rest}`}</li>`;
    }).join("");

    const storyItems = stories.map(s =>
      `<li style="margin-bottom:8px"><a href="${s.url}">${s.title}</a></li>`
    ).join("");
    const storiesSection = stories.length > 0
      ? `<p><strong>Customers Like You</strong></p><ul>${storyItems}</ul>`
      : "";

    const pricingSection = pricing
      ? `<p><strong>Pricing</strong></p><p>Teamtailor's pricing is based on headcount. With ${results.employeeCount} employees, you fall in the ${pricing.tier} employee range at ${pricing.price}/year. Implementation typically takes 30–60 days and you'll have a dedicated Customer Success Manager to support you throughout.</p>`
      : "";

    const signOff = context.repName || "[Your name]";
    const html = `<p>Hi ${name},</p><p>It was great to connect with you today! You can review our call recording and below you'll find a collection of notes and resources based on our chat.</p><p><strong>Positive Outcomes with Teamtailor</strong></p><ul>${outcomeItems}</ul>${storiesSection}<p><strong>Other Resources</strong></p><ul><li><a href="https://www.youtube.com/@teamtailor">Teamtailor How-to Video Library</a> — a great overview of different capabilities</li><li><a href="https://www.teamtailor.com/features/">Feature Library</a> — while we discussed a lot, we likely have even more that could help</li><li><a href="https://www.teamtailor.com/ai/">List of all AI capabilities</a></li></ul>${pricingSection}<p>Let me know if you have any questions, thoughts, or feedback. Happy to keep discussing and find the best path forward.</p><p>Best,<br/>${signOff}</p>`;

    const blob = new Blob([html], { type: "text/html" });
    const plainBlob = new Blob([html.replace(/<[^>]+>/g, "")], { type: "text/plain" });
    const item = new ClipboardItem({ "text/html": blob, "text/plain": plainBlob });
    navigator.clipboard.write([item]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teamtailor-proposal${proposalData.prospectCompany ? `-${proposalData.prospectCompany.toLowerCase().replace(/\s+/g, "-")}` : ""}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("PDF generation failed: " + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const ACCEPTED = ["application/pdf","image/png","image/jpeg","image/jpg","image/webp","text/csv","text/plain","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => ACCEPTED.includes(f.type) || f.name.match(/\.(pdf|png|jpg|jpeg|webp|csv|txt|xlsx|xls)$/i));
    if (valid.length === 0) { setError("Unsupported file type."); return; }
    setError("");
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))];
    });
  };

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files);
  }, []);

  const toBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const getFileType = (f) => {
    if (f.type === "application/pdf") return "document";
    if (f.type.startsWith("image/")) return "image";
    return "text";
  };

  const analyze = async () => {
    if (files.length === 0) return;
    setLoading(true); setError(""); setResults(null); setStories([]);
    try {
      const fileContents = await Promise.all(files.map(async (f) => {
        const ftype = getFileType(f);
        if (ftype === "text") {
          const text = await f.text();
          return { type: "text", text: `[File: ${f.name}]\n${text}` };
        }
        const b64 = await toBase64(f);
        if (ftype === "image") {
          return { type: "image", source: { type: "base64", media_type: f.type, data: b64 } };
        }
        return { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };
      }));

      const contextLines = [
        context.repName && `Rep Name: ${context.repName}`,
        context.prospectTitle && `Prospect Title/Role: ${context.prospectTitle}`,
        context.currentAts && `Current ATS/Recruiting Tool: ${context.currentAts}`,
        context.renewalDate && `Current Contract Renewal Date: ${context.renewalDate}`,
        context.dealNotes && `Additional Deal Notes: ${context.dealNotes}`,
      ].filter(Boolean).join("\n");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          system: `You are a sales intelligence analyst for Teamtailor, an ATS platform. You will be given one or more files — these may include call transcripts, meeting notes, screenshots, CSVs of candidate data, job descriptions, org charts, or other supporting materials. Analyze everything provided and return ONLY a JSON object with exactly these nine keys: prospectName, prospectCompany, employeeCount, currentSituation, positiveOutcomes, suggestedOutcomes, objectionsRaised, recommendedNextSteps, coachingNotes.
${contextLines ? `\nContext provided by the rep:\n${contextLines}\n` : ""}
Rules:
- prospectName: string, first name of the prospect (person being sold to, not the sales rep)
- prospectCompany: string, name of the prospect's company
- employeeCount: number, total employee count mentioned for pricing purposes (0 if not mentioned)
- currentSituation: 3-5 bullets describing the prospect's current pain points and situation
- positiveOutcomes: 3-8 objects for features ACTUALLY DISCUSSED in the call. Each object: "outcome" ("[Feature Name] — [how it solves their specific problem]") and "articleQuery" (3-6 word search query for most relevant Teamtailor support article)
- suggestedOutcomes: 3-5 objects for Teamtailor features NOT discussed but that would clearly benefit this prospect. Each object: "outcome" ("[Feature Name] — [why this would benefit them]") and "articleQuery" (3-6 word search query)
- objectionsRaised: 3-5 bullets of concerns or blockers raised
- recommendedNextSteps: 3-5 bullets of concrete next actions
- coachingNotes: 4-7 coaching bullets for the sales rep. Each bullet should be ONE of these types, labeled with a prefix:
  * "❓ Missed Question: [question you should have asked but didn't]"
  * "⚠️ Product Gap: [honest Teamtailor limitation relevant to this prospect]"
  * "🔍 Clarify: [something vague that needs follow-up]"
  * "💡 Selling Tip: [a better angle you could have used]"
  * "🏆 Competitive Risk: [competitor mentioned or implied, and how to counter]"
  ${context.currentAts ? `The rep noted the prospect currently uses ${context.currentAts} — factor this heavily into competitive coaching notes.` : ""}
  ${context.renewalDate ? `The prospect's current contract renews ${context.renewalDate} — use this for timing urgency in next steps.` : ""}

positiveOutcomes and suggestedOutcomes are arrays of objects. All others are arrays of strings except prospectName/prospectCompany/employeeCount which are primitives. No preamble, no markdown, just raw JSON.`,
          messages: [{
            role: "user",
            content: [
              ...fileContents,
              { type: "text", text: "Analyze all provided materials and return the JSON summary." },
            ],
          }],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API error");
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);

      const fetchArticleForOutcome = async (item) => {
        try {
          const searchRes = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: item.articleQuery || item.outcome || item }),
          });
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            return { ...item, article: searchData.articles?.[0] || null };
          }
        } catch {}
        return item;
      };

      const [outcomesWithArticles, suggestedWithArticles] = await Promise.all([
        Promise.all((parsed.positiveOutcomes || []).map(fetchArticleForOutcome)),
        Promise.all((parsed.suggestedOutcomes || []).map(fetchArticleForOutcome)),
      ]);

      const finalResults = { ...parsed, positiveOutcomes: outcomesWithArticles, suggestedOutcomes: suggestedWithArticles };
      setResults(finalResults);

      const allOutcomes = [
        ...(outcomesWithArticles || []).map(i => i.outcome || i),
        ...(suggestedWithArticles || []).map(i => i.outcome || i),
      ];
      const pricing = getPricingText(parsed.employeeCount);
      setProposalData({
         prospectCompany: parsed.prospectCompany || "",
  prospectName: parsed.prospectName || "",
  listPrice: pricing?.price || "",
  outcomes: allOutcomes,
  repName: context.repName || "",
  repEmail: context.repEmail || "",
  repPhone: context.repPhone || "",
      });
      setShowProposal(false);

      try {
        const storyQuery = [parsed.prospectCompany || "", ...(parsed.currentSituation || []).slice(0, 2)].join(" ");
        const storyRes = await fetch("/api/search-stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: storyQuery }),
        });
        if (storyRes.ok) {
          const storyData = await storyRes.json();
          setStories(storyData.stories || []);
        }
      } catch {}

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const importArticles = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const secret = prompt("Enter your CRON_SECRET:");
    if (!secret) return;
    setImporting(true); setCrawlStatus("Importing articles...");
    try {
      const text = await f.text();
      const articles = JSON.parse(text);
      const chunkSize = 10;
      let totalProcessed = 0;
      for (let i = 0; i < articles.length; i += chunkSize) {
        const chunk = articles.slice(i, i + chunkSize);
        setCrawlStatus(`Importing... ${Math.min(i + chunkSize, articles.length)}/${articles.length}`);
        const res = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
          body: JSON.stringify({ articles: chunk }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        totalProcessed += data.processed;
      }
      setCrawlStatus(`✓ Done! ${totalProcessed} articles indexed.`);
    } catch (err) {
      setCrawlStatus(`✗ Import failed: ${err.message}`);
    } finally {
      setImporting(false); e.target.value = "";
    }
  };
  const analyzePickup = async () => {
  if (files.length === 0) return;
  setLoading(true); setError(""); setPickupEmail(null);
  try {
    const fileContents = await Promise.all(files.map(async (f) => {
      const ftype = getFileType(f);
      if (ftype === "text") { const text = await f.text(); return { type: "text", text: `[File: ${f.name}]\n${text}` }; }
      const b64 = await toBase64(f);
      if (ftype === "image") return { type: "image", source: { type: "base64", media_type: f.type, data: b64 } };
      return { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } };
    }));
    const ctxLines = [
      context.repName && `Rep Name: ${context.repName}`,
      context.prospectTitle && `Prospect Title: ${context.prospectTitle}`,
      context.currentAts && `Current ATS: ${context.currentAts}`,
      context.renewalDate && `Contract Renewal: ${context.renewalDate}`,
      context.dealNotes && `Deal Notes: ${context.dealNotes}`,
    ].filter(Boolean).join("\n");
    const sys = `You are a sales assistant helping a new Teamtailor rep pick up a deal mid-cycle from a colleague who has left. Analyze all provided materials and generate a warm re-introduction email.${ctxLines ? "\n\nContext:\n" + ctxLines : ""}\n\nThe email should:\n- Open with a warm intro of the new rep taking over\n- Summarize your current understanding of where things stand\n- Reference any agreed next steps or open items from the notes\n- If no clear next steps exist, suggest connecting in the next week\n- Be genuine and human, not salesy\n- Sign off with rep name if provided\n- Keep it 150-200 words max\n\nReturn ONLY JSON with keys: prospectName, prospectCompany, subject, body (use real newlines), summary (3-5 strings of what you found — shown to rep only). Raw JSON, no markdown.`;
    const response = await fetch("/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, system: sys, messages: [{ role: "user", content: [...fileContents, { type: "text", text: "Analyze and generate the re-engagement email." }] }] }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API error");
    const parsed = JSON.parse(data.content[0].text.replace(/```json|```/g, "").trim());
    setPickupEmail(parsed);
  } catch (err) { setError(err.message || "Something went wrong."); }
  finally { setLoading(false); }
};

  const importStories = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const secret = prompt("Enter your CRON_SECRET:");
    if (!secret) return;
    setImportingStories(true); setCrawlStatus("Importing stories...");
    try {
      const text = await f.text();
      const storiesData = JSON.parse(text);
      const chunkSize = 10;
      let totalProcessed = 0;
      for (let i = 0; i < storiesData.length; i += chunkSize) {
        const chunk = storiesData.slice(i, i + chunkSize);
        setCrawlStatus(`Importing stories... ${Math.min(i + chunkSize, storiesData.length)}/${storiesData.length}`);
        const res = await fetch("/api/ingest-stories", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
          body: JSON.stringify({ stories: chunk }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        totalProcessed += data.processed;
      }
      setCrawlStatus(`✓ Done! ${totalProcessed} stories indexed.`);
    } catch (err) {
      setCrawlStatus(`✗ Stories import failed: ${err.message}`);
    } finally {
      setImportingStories(false); e.target.value = "";
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-dot">T</div>
            Tailored
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {crawlStatus && (
              <span style={{ fontSize: 12, color: crawlStatus.startsWith("✓") ? "#00C896" : crawlStatus.startsWith("✗") ? "#FF4444" : "var(--text-muted)" }}>
                {crawlStatus}
              </span>
            )}
            <label style={{
              padding: "7px 14px", background: importingStories ? "var(--surface)" : "var(--pink-muted)",
              border: "1.5px solid var(--pink-border)", borderRadius: 8,
              color: importingStories ? "var(--text-muted)" : "var(--pink)",
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
              cursor: importingStories ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}>
              {importingStories ? "Importing..." : "↑ Import Stories"}
              <input type="file" accept=".json" style={{ display: "none" }} onChange={importStories} disabled={importingStories} />
            </label>
            <label style={{
              padding: "7px 14px", background: importing ? "var(--surface)" : "var(--pink-muted)",
              border: "1.5px solid var(--pink-border)", borderRadius: 8,
              color: importing ? "var(--text-muted)" : "var(--pink)",
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
              cursor: importing ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}>
              {importing ? "Importing..." : "↑ Import Articles"}
              <input type="file" accept=".json" style={{ display: "none" }} onChange={importArticles} disabled={importing} />
            </label>
            <div className="tagline">Sales Intelligence</div>
          </div>
        </header>

        <main className="main">
          {loading && (
            <div className="loading">
              <div className="loading-ring" />
              <div className="loading-text">Analyzing transcript</div>
              <div className="loading-sub">This takes about 10–20 seconds</div>
            </div>
          )}
          {!loading && pickupEmail && (
  <div className="results">
    <div className="results-header">
      <div>
        <div className="results-title">Re-engagement Email</div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{pickupEmail.prospectName} · {pickupEmail.prospectCompany}</div>
      </div>
    </div>
    <div style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div className="section-header" style={{ borderBottomColor: "#DDD6FE" }}>
        <div className="section-pip" style={{ background: "#6C63FF" }} />
        <span className="section-title" style={{ color: "#5B21B6" }}>What We Found in the Notes</span>
      </div>
      <ul className="section-items">
        {(pickupEmail.summary || []).map((s, i) => <li className="section-item" key={i}>{s}</li>)}
      </ul>
    </div>
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>📧 Re-engagement Email</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Ready to send — copy into your email client</div>
        </div>
        <button onClick={() => {
          const html = pickupEmail.body.split("\n").map(l => l ? `<p>${l}</p>` : "<br/>").join("");
          const blob = new Blob([html], { type: "text/html" });
          const plain = new Blob([pickupEmail.body], { type: "text/plain" });
          navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": plain })]);
        }} style={{
          padding: "10px 20px", background: "#6C63FF", color: "white", border: "none",
          borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Copy to Clipboard</button>
      </div>
      <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "28px 32px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Subject</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>{pickupEmail.subject}</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 14, lineHeight: 1.9, color: "var(--text)", whiteSpace: "pre-line" }}>{pickupEmail.body}</div>
      </div>
    </div>
    <button className="reset-btn" onClick={() => { setPickupEmail(null); setFiles([]); setMode("analyze"); }}>← Start over</button>
  </div>
)}

          {!loading && !results && !authed && (
            <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Welcome to Tailored</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>Enter your team password to get started</div>
              <input
                type="password" className="api-input" placeholder="Enter password..."
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", marginBottom: 12, textAlign: "center", fontSize: 16 }}
              />
              {authError && <div className="error-box" style={{ marginBottom: 12 }}>⚠ {authError}</div>}
              <button className="analyze-btn" onClick={handleLogin} disabled={!password}>Enter →</button>
            </div>
          )}

          {!loading && !results && authed && (
            <>
              <div className="page-title">Analyze a call</div>
              <div className="page-sub">Upload any combination of transcripts, notes, screenshots, or CSVs — then add context to sharpen the output.</div>

              <div
                className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.xlsx,.xls" multiple className="file-input"
                  onChange={(e) => addFiles(e.target.files)} />
                <div className="upload-icon">📎</div>
                <div className="upload-title">Drop files here</div>
                <div className="upload-sub"><strong>PDF, images, CSV, TXT</strong> · Multiple files supported</div>
              </div>

              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {files.map((f) => {
                    const icon = f.type.startsWith("image/") ? "🖼️" : f.type === "application/pdf" ? "📄" : "📊";
                    return (
                      <div key={f.name} className="file-selected" style={{ marginBottom: 0 }}>
                        <span className="file-name">{icon} {f.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
                          <button onClick={() => removeFile(f.name)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, lineHeight: 1 }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                  Context & Deal Info <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — improves output)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Your Name</label>
                    <input className="api-input" placeholder="e.g. Eric Klank"
                      value={context.repName} onChange={e => setContext(p => ({ ...p, repName: e.target.value }))}
                      style={{ width: "100%", fontSize: 13 }} />
                  </div>
                  <div>
  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Your Email</label>
  <input className="api-input" placeholder="e.g. eric@teamtailor.com"
    value={context.repEmail} onChange={e => setContext(p => ({ ...p, repEmail: e.target.value }))}
    style={{ width: "100%", fontSize: 13 }} />
</div>
<div>
  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Your Phone</label>
  <input className="api-input" placeholder="e.g. (815) 482-5699"
    value={context.repPhone} onChange={e => setContext(p => ({ ...p, repPhone: e.target.value }))}
    style={{ width: "100%", fontSize: 13 }} />
</div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Prospect's Title / Role</label>
                    <input className="api-input" placeholder="e.g. Head of Talent"
                      value={context.prospectTitle} onChange={e => setContext(p => ({ ...p, prospectTitle: e.target.value }))}
                      style={{ width: "100%", fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Current ATS / Recruiting Tool</label>
                    <input className="api-input" placeholder="e.g. Greenhouse, Lever, Workday"
                      value={context.currentAts} onChange={e => setContext(p => ({ ...p, currentAts: e.target.value }))}
                      style={{ width: "100%", fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Contract Renewal / End Date</label>
                    <input className="api-input" placeholder="e.g. March 2026"
                      value={context.renewalDate} onChange={e => setContext(p => ({ ...p, renewalDate: e.target.value }))}
                      style={{ width: "100%", fontSize: 13 }} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Deal Notes</label>
                    <textarea className="api-input" placeholder="e.g. Budget ~$15k, CFO approval needed, mentioned Workable as competitor..."
                      value={context.dealNotes} onChange={e => setContext(p => ({ ...p, dealNotes: e.target.value }))}
                      rows={2} style={{ width: "100%", fontSize: 13, resize: "vertical" }} />
                  </div>
                </div>
              </div>

              {error && <div className="error-box">⚠ {error}</div>}
              <button className="analyze-btn" disabled={files.length === 0} onClick={analyze}>Analyze Transcript</button>
            </>
          )}

          {!loading && results && (
            <div className="results">
              <div className="results-header">
                <div>
                  <div className="results-title">Call Analysis</div>
                  {results.prospectCompany && (
                    <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                      {results.prospectName} · {results.prospectCompany}
                    </div>
                  )}
                </div>
                <div className="results-file">{files.map(f => f.name).join(", ")}</div>
              </div>

              <div className="grid">
                {SECTIONS.map((s) => {
                  const items = results[s.key] || [];
                  if (s.coaching) {
                    return (
                      <div className="coaching-card" key={s.key} style={{ gridColumn: "1 / -1" }}>
                        <div className="section-header" style={{ borderBottomColor: "#BAE6FD" }}>
                          <div className="section-pip" style={{ background: s.color }} />
                          <span className="section-title" style={{ color: "#0369A1" }}>{s.label}</span>
                          <span style={{
                            marginLeft: "auto", fontSize: 11, fontWeight: 600, color: s.color,
                            background: `${s.color}15`, border: `1px solid ${s.color}40`,
                            borderRadius: 6, padding: "2px 8px",
                          }}>{s.badge}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {items.map((item, i) => {
                            const text = typeof item === "string" ? item : item.outcome || "";
                            const typeColors = {
                              "❓": { bg: "#FFF7ED", border: "#FED7AA", label: "#C2410C" },
                              "⚠️": { bg: "#FFF1F2", border: "#FECDD3", label: "#BE123C" },
                              "🔍": { bg: "#F0FDF4", border: "#BBF7D0", label: "#15803D" },
                              "💡": { bg: "#FEFCE8", border: "#FEF08A", label: "#A16207" },
                              "🏆": { bg: "#F5F3FF", border: "#DDD6FE", label: "#6D28D9" },
                            };
                            const emoji = Object.keys(typeColors).find(e => text.startsWith(e));
                            const colors = emoji ? typeColors[emoji] : { bg: "#F0F9FF", border: "#BAE6FD", label: "#0369A1" };
                            const colonIdx = text.indexOf(": ");
                            const label = colonIdx > -1 ? text.slice(0, colonIdx + 1) : "";
                            const body = colonIdx > -1 ? text.slice(colonIdx + 2) : text;
                            return (
                              <div key={i} className="coaching-item" style={{ background: colors.bg, borderColor: colors.border }}>
                                {label && <span style={{ fontWeight: 700, color: colors.label, display: "block", marginBottom: 3, fontSize: 11 }}>{label}</span>}
                                <span style={{ fontSize: 13 }}>{body}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="section-card" key={s.key} style={s.span === 2 ? { gridColumn: "1 / -1" } : {}}>
                      <div className="section-header">
                        <div className="section-pip" style={{ background: s.color }} />
                        <span className="section-title">{s.label}</span>
                        {s.badge && (
                          <span style={{
                            marginLeft: "auto", fontSize: 11, fontWeight: 600, color: s.color,
                            background: `${s.color}15`, border: `1px solid ${s.color}40`,
                            borderRadius: 6, padding: "2px 8px",
                          }}>{s.badge}</span>
                        )}
                      </div>
                      <ul className="section-items">
                        {items.map((item, i) => {
                          if ((s.key === "positiveOutcomes" || s.key === "suggestedOutcomes") && item.outcome) {
                            return (
                              <li className="section-item" key={i}>
                                {item.outcome}
                                {item.article && (
                                  <a href={item.article.url} target="_blank" rel="noopener noreferrer" style={{
                                    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11,
                                    color: s.color, fontWeight: 600, textDecoration: "none",
                                    background: `${s.color}10`, border: `1px solid ${s.color}30`,
                                    borderRadius: 6, padding: "3px 8px",
                                  }}>
                                    📄 {item.article.title}
                                  </a>
                                )}
                              </li>
                            );
                          }
                          return <li className="section-item" key={i}>{typeof item === "string" ? item : item.outcome}</li>;
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {stories.length > 0 && (
                <div className="section-card" style={{ marginBottom: 24 }}>
                  <div className="section-header">
                    <div className="section-pip" style={{ background: "#6C63FF" }} />
                    <span className="section-title">Customers Like You</span>
                    <span style={{
                      marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#6C63FF",
                      background: "#6C63FF15", border: "1px solid #6C63FF40",
                      borderRadius: 6, padding: "2px 8px",
                    }}>🏆 Success Stories</span>
                  </div>
                  <ul className="section-items">
                    {stories.map((s, i) => (
                      <li className="section-item" key={i}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#6C63FF", fontWeight: 600, textDecoration: "none" }}>
                          {s.title}
                        </a>
                        {s.excerpt && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.excerpt}...</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="reset-btn" onClick={() => { setResults(null); setFiles([]); setStories([]); setProposalData(null); setShowProposal(false); }}>
                ← Analyze another call
              </button>

              <div style={{ marginTop: 16, marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>📄 1-Pager Proposal</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Edit before downloading as PDF</div>
                  </div>
                  <button onClick={() => setShowProposal(p => !p)} style={{
                    padding: "10px 20px", background: "var(--pink-muted)", color: "var(--pink)",
                    border: "1.5px solid var(--pink-border)", borderRadius: 10,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>
                    {showProposal ? "Hide Editor" : "Edit & Download"}
                  </button>
                </div>

                {showProposal && proposalData && (
                  <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "28px 32px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Company Name</div>
                        <input value={proposalData.prospectCompany}
                          onChange={e => setProposalData(p => ({ ...p, prospectCompany: e.target.value }))}
                          style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text)", background: "white", outline: "none" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>List Price</div>
                        <input value={proposalData.listPrice}
                          onChange={e => setProposalData(p => ({ ...p, listPrice: e.target.value }))}
                          style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text)", background: "white", outline: "none" }} />
                      </div>
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Benefits / Outcomes</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                      {proposalData.outcomes.map((outcome, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <textarea value={outcome}
                            onChange={e => setProposalData(p => {
                              const outcomes = [...p.outcomes];
                              outcomes[i] = e.target.value;
                              return { ...p, outcomes };
                            })}
                            rows={2}
                            style={{ flex: 1, padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text)", background: "white", outline: "none", resize: "vertical" }} />
                          <button onClick={() => setProposalData(p => ({ ...p, outcomes: p.outcomes.filter((_, j) => j !== i) }))}
                            style={{ padding: "8px 10px", background: "none", border: "1.5px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                      <button onClick={() => setProposalData(p => ({ ...p, outcomes: [...p.outcomes, ""] }))}
                        style={{ alignSelf: "flex-start", padding: "8px 16px", background: "var(--pink-muted)", border: "1.5px solid var(--pink-border)", borderRadius: 8, color: "var(--pink)", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        + Add Outcome
                      </button>
                    </div>

                    <button onClick={downloadPdf} disabled={generatingPdf} style={{
                      width: "100%", padding: "14px",
                      background: generatingPdf ? "var(--surface)" : "linear-gradient(135deg, #FF2D78, #FF6BA8)",
                      color: generatingPdf ? "var(--text-muted)" : "white", border: "none", borderRadius: 12,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                      cursor: generatingPdf ? "not-allowed" : "pointer", transition: "all 0.2s",
                    }}>
                      {generatingPdf ? "Generating PDF..." : "⬇ Download PDF"}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, marginBottom: 60 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>📧 Follow-up Email</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Ready to send — copy and paste into your email client</div>
                  </div>
                  <button onClick={copyEmail} style={{
                    padding: "10px 20px", background: copied ? "#00C896" : "var(--pink)",
                    color: "white", border: "none", borderRadius: 10,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap",
                  }}>
                    {copied ? "✓ Copied!" : "Copy to Clipboard"}
                  </button>
                </div>

                <div style={{
                  background: "var(--surface)", border: "1.5px solid var(--border)",
                  borderRadius: 14, padding: "28px 32px", fontFamily: "Georgia, serif",
                  fontSize: 14, lineHeight: 1.9, color: "var(--text)",
                }}>
                  <p style={{ margin: "0 0 16px" }}>Hi {results.prospectName || "there"},</p>
                  <p style={{ margin: "0 0 24px" }}>
                    It was great to connect with you today! You can review our call recording and below you'll find a collection of notes and resources based on our chat.
                  </p>

                  <p style={{ margin: "0 0 10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Positive Outcomes with Teamtailor</p>
                  <ul style={{ margin: "0 0 24px", paddingLeft: 20 }}>
                    {(results.positiveOutcomes || []).map((item, i) => {
                      const text = item.outcome || item;
                      const url = item.article?.url;
                      const dashIdx = text.indexOf(" — ");
                      const featureName = dashIdx > -1 ? text.slice(0, dashIdx) : text;
                      const rest = dashIdx > -1 ? text.slice(dashIdx) : "";
                      return (
                        <li key={i} style={{ marginBottom: 8 }}>
                          {url
                            ? <><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--pink)", fontWeight: 600 }}>{featureName}</a>{rest}</>
                            : <><strong>{featureName}</strong>{rest}</>
                          }
                        </li>
                      );
                    })}
                  </ul>

                  {stories.length > 0 && (
                    <>
                      <p style={{ margin: "0 0 10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Customers Like You</p>
                      <ul style={{ margin: "0 0 24px", paddingLeft: 20 }}>
                        {stories.map((s, i) => (
                          <li key={i} style={{ marginBottom: 8 }}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--pink)", fontWeight: 600 }}>{s.title}</a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <p style={{ margin: "0 0 10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Other Resources</p>
                  <ul style={{ margin: "0 0 24px", paddingLeft: 20 }}>
                    <li style={{ marginBottom: 6 }}>
                      <a href="https://www.youtube.com/@teamtailor" target="_blank" rel="noopener noreferrer" style={{ color: "var(--pink)", fontWeight: 600 }}>Teamtailor How-to Video Library</a> — a great overview of different capabilities
                    </li>
                    <li style={{ marginBottom: 6 }}>
                      <a href="https://www.teamtailor.com/features/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--pink)", fontWeight: 600 }}>Feature Library</a> — while we discussed a lot, we likely have even more that could help
                    </li>
                    <li style={{ marginBottom: 6 }}>
                      <a href="https://www.teamtailor.com/ai/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--pink)", fontWeight: 600 }}>List of all AI capabilities</a>
                    </li>
                  </ul>

                  {getPricingText(results.employeeCount) && (() => {
                    const p = getPricingText(results.employeeCount);
                    return (
                      <>
                        <p style={{ margin: "0 0 10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Pricing</p>
                        <p style={{ margin: "0 0 24px" }}>
                          Teamtailor's pricing is based on headcount. With {results.employeeCount} employees, you fall in the {p.tier} employee range at {p.price}/year. Implementation typically takes 30–60 days and you'll have a dedicated Customer Success Manager to support you throughout.
                        </p>
                      </>
                    );
                  })()}

                  <p style={{ margin: "0 0 6px" }}>Let me know if you have any questions, thoughts, or feedback. Happy to keep discussing and find the best path forward.</p>
                  <p style={{ margin: "0 0 6px" }}>Best,</p>
                  <p style={{ margin: 0 }}>{context.repName || "[Your name]"}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
