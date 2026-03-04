import { useState, useCallback, useEffect } from "react";

const SECTIONS = [
  { key: "currentSituation", label: "Current Situation", color: "#FF2D78", span: 1 },
  { key: "positiveOutcomes", label: "Discussed in Call", color: "#00C896", span: 1 },
  { key: "suggestedOutcomes", label: "You Might Have Missed", color: "#FF8C42", span: 1, badge: "💡 AI Suggested" },
  { key: "objectionsRaised", label: "Objections Raised", color: "#E0294A", span: 1 },
  { key: "recommendedNextSteps", label: "Recommended Next Steps", color: "#6C63FF", span: 2 },
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

  /* Collapsible section cards */
  .section-card {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden;
  }
  .section-card-header {
    display: flex; align-items: center; gap: 8px; padding: 18px 24px;
    cursor: pointer; user-select: none; transition: background 0.15s;
  }
  .section-card-header:hover { background: rgba(0,0,0,0.02); }
  .section-card-body { padding: 0 24px 20px; }
  .section-pip { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); }
  .chevron {
    margin-left: auto; font-size: 10px; color: var(--text-muted);
    transition: transform 0.2s; display: flex; align-items: center;
  }
  .chevron.open { transform: rotate(180deg); }
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
    font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
  }
  .reset-btn:hover { border-color: var(--pink); color: var(--pink); }
  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; }
    .header { padding: 0 20px; }
    .main { padding: 32px 16px 60px; }
  }
`;

export default function App() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
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
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  // Rep info fields
  const [repName, setRepName] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [repPhone, setRepPhone] = useState("");

  // All sections collapsed by default
  const [openSections, setOpenSections] = useState({});
  const [openStories, setOpenStories] = useState(false);
  const [openProposal, setOpenProposal] = useState(false);
  const [openEmail, setOpenEmail] = useState(false);

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  // On mount: check if this is a shared report URL
  useEffect(() => {
    const match = window.location.pathname.match(/^\/report\/([a-f0-9]+)$/);
    if (match) {
      const id = match[1];
      setLoading(true);
      fetch(`/api/get-report?id=${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) { setError("Report not found or expired."); return; }
          const r = data.results || data;
          setResults(r);
          setStories(data.stories || []);
          setProposalData(data.proposalData || null);
          setAuthed(true);
          setIsSharedView(true);
        })
        .catch(() => setError("Failed to load shared report."))
        .finally(() => setLoading(false));
    }
  }, []);

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

  // Extract metrics mentioned in the call for ROI callouts in email
  const buildMetricCallouts = (results) => {
    const situation = (results?.currentSituation || []).join(" ");
    const outcomes = (results?.positiveOutcomes || []).map(i => i.outcome || i).join(" ");
    const allText = situation + " " + outcomes;

    const callouts = [];

    // Applicant/candidate volumes
    const applicantMatch = allText.match(/(\d[\d,]*)\s*(applicants?|candidates?|applications?)\s*(per|each|a|\/)\s*(role|job|position|month|week)/i);
    if (applicantMatch) {
      const vol = applicantMatch[1];
      callouts.push(`With ${vol} applicants per role, AI screening can cut your review time from hours to under 10 minutes per position`);
    }

    // Time spent on hiring tasks
    const hoursMatch = allText.match(/(\d+)\s*hours?\s*(per|a|\/)\s*(week|day|month)/i);
    if (hoursMatch) {
      const hrs = hoursMatch[1];
      const period = hoursMatch[3];
      callouts.push(`Automating your current workflows could recover those ${hrs} hours/${period} for higher-value work`);
    }

    // Number of open roles
    const rolesMatch = allText.match(/(\d+)\s*(open|active|current)?\s*(roles?|positions?|jobs?|requisitions?)/i);
    if (rolesMatch) {
      const num = rolesMatch[1];
      callouts.push(`Managing ${num} open roles simultaneously is exactly where Teamtailor's pipeline view and bulk actions make the biggest impact`);
    }

    // Team size for hiring
    const teamMatch = allText.match(/(\d+)\s*(person|people|member|strong)?\s*(HR|recruiting|talent|hiring)\s*team/i);
    if (teamMatch) {
      const size = teamMatch[1];
      callouts.push(`For a ${size}-person team handling your hiring volume, automation isn't a nice-to-have — it's how you scale without burning out`);
    }

    // Time to fill / hiring speed
    const ttfMatch = allText.match(/(\d+)\s*(days?|weeks?|months?)\s*(to\s*)?(fill|hire|close)/i);
    if (ttfMatch) {
      const duration = `${ttfMatch[1]} ${ttfMatch[2]}`;
      callouts.push(`Cutting your current ${duration} time-to-fill is achievable with automated screening, instant interview scheduling, and real-time pipeline visibility`);
    }

    return callouts;
  };

  const copyEmail = () => {
    const name = results?.prospectName || "there";
    const pricing = getPricingText(results?.employeeCount);
    const metricCallouts = buildMetricCallouts(results);

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

    const metricsSection = metricCallouts.length > 0
      ? `<p><strong>Based on Your Numbers</strong></p><ul>${metricCallouts.map(c => `<li style="margin-bottom:8px">${c}</li>`).join("")}</ul>`
      : "";

    const pricingSection = pricing
      ? `<p><strong>Pricing</strong></p><p>Teamtailor's pricing is based on headcount. With ${results.employeeCount} employees, you fall in the ${pricing.tier} employee range at ${pricing.price}/year. Implementation typically takes 30–60 days and you'll have a dedicated Customer Success Manager to support you throughout.</p>`
      : "";

    const signOff = `<p>Best,</p><p>${repName || "[Your name]"}${repEmail ? `<br/>${repEmail}` : ""}${repPhone ? `<br/>${repPhone}` : ""}</p>`;

    const html = `<p>Hi ${name},</p><p>It was great to connect with you today! You can review our call recording and below you'll find a collection of notes and resources based on our chat.</p>${metricsSection}<p><strong>Positive Outcomes with Teamtailor</strong></p><ul>${outcomeItems}</ul>${storiesSection}<p><strong>Other Resources</strong></p><ul><li><a href="https://www.youtube.com/@teamtailor">Teamtailor How-to Video Library</a> — a great overview of different capabilities</li><li><a href="https://www.teamtailor.com/features/">Feature Library</a> — while we discussed a lot, we likely have even more that could help</li><li><a href="https://www.teamtailor.com/ai/">List of all AI capabilities</a></li></ul>${pricingSection}<p>Let me know if you have any questions, thoughts, or feedback. Happy to keep discussing and find the best path forward.</p>${signOff}`;

    const blob = new Blob([html], { type: "text/html" });
    const plainBlob = new Blob([html.replace(/<[^>]+>/g, "")], { type: "text/plain" });
    const item = new ClipboardItem({ "text/html": blob, "text/plain": plainBlob });
    navigator.clipboard.write([item]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareReport = async () => {
    setSharing(true);
    try {
      const res = await fetch("/api/save-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, stories, proposalData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShareUrl(data.url);
      navigator.clipboard.writeText(data.url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (err) {
      alert("Share failed: " + err.message);
    } finally {
      setSharing(false);
    }
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

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") { setFile(f); setError(""); }
    else setError("Please upload a PDF file.");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]);
  }, []);

  const toBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResults(null); setStories([]);
    setOpenSections({}); setOpenStories(false); setOpenProposal(false); setOpenEmail(false);
    setShareUrl(""); setShareCopied(false);
    try {
      const base64 = await toBase64(file);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          system: `You are a sales intelligence analyst for Teamtailor, an ATS platform. Analyze the provided sales call transcript and return ONLY a JSON object with exactly these eight keys: prospectName, prospectCompany, employeeCount, currentSituation, positiveOutcomes, suggestedOutcomes, objectionsRaised, recommendedNextSteps.

Rules:
- prospectName: string, first name of the prospect (person being sold to, not the sales rep)
- prospectCompany: string, name of the prospect's company
- employeeCount: number, total employee count mentioned for pricing purposes (0 if not mentioned)
- currentSituation: 3-5 bullets describing the prospect's current pain points and situation
- positiveOutcomes: 3-8 objects for features ACTUALLY DISCUSSED in the call. Each object: "outcome" ("[Feature Name] — [how it solves their specific problem]") and "articleQuery" (3-6 word search query for most relevant Teamtailor support article)
- suggestedOutcomes: 3-5 objects for Teamtailor features NOT discussed but that would clearly benefit this prospect. Each object: "outcome" ("[Feature Name] — [why this would benefit them]") and "articleQuery" (3-6 word search query)
- objectionsRaised: 3-5 bullets of concerns or blockers raised
- recommendedNextSteps: 3-5 bullets of concrete next actions

positiveOutcomes and suggestedOutcomes are arrays of objects. All others are arrays of strings except prospectName/prospectCompany/employeeCount which are primitives. No preamble, no markdown, just raw JSON.`,
          messages: [{
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              { type: "text", text: "Analyze this sales call transcript and return the JSON summary." },
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
        repName: repName,
        repEmail: repEmail,
        repPhone: repPhone,
      });
      setShowProposal(false);

      try {
        const storyQuery = [
          parsed.prospectCompany || "",
          ...(parsed.currentSituation || []).slice(0, 2),
        ].join(" ");
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

  const metricCallouts = results ? buildMetricCallouts(results) : [];

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

            {/* Analyze another call — only shown when viewing results, not in shared view */}
            {results && !isSharedView && (
              <button
                className="reset-btn"
                onClick={() => { setResults(null); setFile(null); setStories([]); setProposalData(null); setShowProposal(false); setShareUrl(""); setOpenSections({}); }}
              >
                ← New Analysis
              </button>
            )}

            {/* Share Report — only shown when viewing results, not already in shared view */}
            {results && !isSharedView && (
              <button
                onClick={shareReport}
                disabled={sharing}
                style={{
                  padding: "7px 16px",
                  background: shareCopied ? "#00C896" : "linear-gradient(135deg, #FF2D78, #FF6BA8)",
                  color: "white", border: "none", borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                  cursor: sharing ? "not-allowed" : "pointer", transition: "all 0.2s",
                  opacity: sharing ? 0.6 : 1,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {sharing ? "Saving..." : shareCopied ? "✓ Link Copied!" : "🔗 Share Report"}
              </button>
            )}

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
              <div className="page-sub">Upload a transcript PDF and get an instant structured breakdown.</div>
              <div
                className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input type="file" accept=".pdf" className="file-input" onChange={(e) => handleFile(e.target.files[0])} />
                <div className="upload-icon">📄</div>
                <div className="upload-title">Drop your transcript here</div>
                <div className="upload-sub"><strong>PDF format</strong> · Drag & drop or click to browse</div>
              </div>
              {file && (
                <div className="file-selected">
                  <span className="file-name">📄 {file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              )}

              {/* Rep info fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Your Name</div>
                  <input
                    className="api-input"
                    placeholder="e.g. Sarah Jones"
                    value={repName}
                    onChange={e => setRepName(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Your Email</div>
                  <input
                    className="api-input"
                    placeholder="e.g. sarah@teamtailor.com"
                    value={repEmail}
                    onChange={e => setRepEmail(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Your Phone</div>
                  <input
                    className="api-input"
                    placeholder="e.g. +1 555 000 0000"
                    value={repPhone}
                    onChange={e => setRepPhone(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              {error && <div className="error-box">⚠ {error}</div>}
              <button className="analyze-btn" disabled={!file} onClick={analyze}>Analyze Transcript</button>
            </>
          )}

          {!loading && results && (
            <div className="results">
              {/* Results header — no URL text, just title + prospect */}
              <div className="results-header" style={{ marginBottom: 28 }}>
                <div>
                  <div className="results-title">Call Analysis</div>
                  {results.prospectCompany && (
                    <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                      {results.prospectName} · {results.prospectCompany}
                    </div>
                  )}
                </div>
              </div>

              {/* Main collapsible sections grid */}
              <div className="grid">
                {SECTIONS.map((s) => (
                  <div className="section-card" key={s.key} style={s.span === 2 ? { gridColumn: "1 / -1" } : {}}>
                    <div className="section-card-header" onClick={() => toggleSection(s.key)}>
                      <div className="section-pip" style={{ background: s.color }} />
                      <span className="section-title">{s.label}</span>
                      {s.badge && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: s.color,
                          background: `${s.color}15`, border: `1px solid ${s.color}40`,
                          borderRadius: 6, padding: "2px 8px", marginLeft: 8,
                        }}>{s.badge}</span>
                      )}
                      <span className={`chevron ${openSections[s.key] ? "open" : ""}`}>▼</span>
                    </div>
                    {openSections[s.key] && (
                      <div className="section-card-body">
                        <ul className="section-items">
                          {(results[s.key] || []).map((item, i) => {
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
                    )}
                  </div>
                ))}
              </div>

              {/* Customer Stories — collapsible */}
              {stories.length > 0 && (
                <div className="section-card" style={{ marginBottom: 20 }}>
                  <div className="section-card-header" onClick={() => setOpenStories(v => !v)}>
                    <div className="section-pip" style={{ background: "#6C63FF" }} />
                    <span className="section-title">Customers Like You</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: "#6C63FF",
                      background: "#6C63FF15", border: "1px solid #6C63FF40",
                      borderRadius: 6, padding: "2px 8px", marginLeft: 8,
                    }}>🏆 Success Stories</span>
                    <span className={`chevron ${openStories ? "open" : ""}`}>▼</span>
                  </div>
                  {openStories && (
                    <div className="section-card-body">
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
                </div>
              )}

              {/* 1-Pager Proposal — collapsible */}
              <div className="section-card" style={{ marginBottom: 20 }}>
                <div className="section-card-header" onClick={() => setOpenProposal(v => !v)}>
                  <div className="section-pip" style={{ background: "#FF2D78" }} />
                  <span className="section-title">1-Pager Proposal</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#FF2D78",
                    background: "#FF2D7815", border: "1px solid #FF2D7840",
                    borderRadius: 6, padding: "2px 8px", marginLeft: 8,
                  }}>PDF Download</span>
                  <span className={`chevron ${openProposal ? "open" : ""}`}>▼</span>
                </div>
                {openProposal && proposalData && (
                  <div className="section-card-body">
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Company Name</div>
                          <input
                            value={proposalData.prospectCompany}
                            onChange={e => setProposalData(p => ({ ...p, prospectCompany: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text)", background: "white", outline: "none" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>List Price</div>
                          <input
                            value={proposalData.listPrice}
                            onChange={e => setProposalData(p => ({ ...p, listPrice: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text)", background: "white", outline: "none" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Rep Name</div>
                          <input
                            value={proposalData.repName || ""}
                            onChange={e => setProposalData(p => ({ ...p, repName: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text)", background: "white", outline: "none" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Rep Email</div>
                          <input
                            value={proposalData.repEmail || ""}
                            onChange={e => setProposalData(p => ({ ...p, repEmail: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text)", background: "white", outline: "none" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Rep Phone</div>
                          <input
                            value={proposalData.repPhone || ""}
                            onChange={e => setProposalData(p => ({ ...p, repPhone: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text)", background: "white", outline: "none" }}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Benefits / Outcomes</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                        {proposalData.outcomes.map((outcome, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <textarea
                              value={outcome}
                              onChange={e => setProposalData(p => {
                                const outcomes = [...p.outcomes];
                                outcomes[i] = e.target.value;
                                return { ...p, outcomes };
                              })}
                              rows={2}
                              style={{ flex: 1, padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text)", background: "white", outline: "none", resize: "vertical" }}
                            />
                            <button
                              onClick={() => setProposalData(p => ({ ...p, outcomes: p.outcomes.filter((_, j) => j !== i) }))}
                              style={{ padding: "8px 10px", background: "none", border: "1.5px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", fontSize: 14, flexShrink: 0 }}
                            >✕</button>
                          </div>
                        ))}
                        <button
                          onClick={() => setProposalData(p => ({ ...p, outcomes: [...p.outcomes, ""] }))}
                          style={{ alignSelf: "flex-start", padding: "8px 16px", background: "var(--pink-muted)", border: "1.5px solid var(--pink-border)", borderRadius: 8, color: "var(--pink)", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >+ Add Outcome</button>
                      </div>
                      <button
                        onClick={downloadPdf}
                        disabled={generatingPdf}
                        style={{
                          width: "100%", padding: "14px",
                          background: generatingPdf ? "var(--surface)" : "linear-gradient(135deg, #FF2D78, #FF6BA8)",
                          color: generatingPdf ? "var(--text-muted)" : "white", border: "none", borderRadius: 12,
                          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                          cursor: generatingPdf ? "not-allowed" : "pointer",
                        }}
                      >
                        {generatingPdf ? "Generating PDF..." : "⬇ Download PDF"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up Email — collapsible */}
              <div className="section-card" style={{ marginBottom: 60 }}>
                <div className="section-card-header" onClick={() => setOpenEmail(v => !v)}>
                  <div className="section-pip" style={{ background: "#00C896" }} />
                  <span className="section-title">Follow-up Email</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#00C896",
                    background: "#00C89615", border: "1px solid #00C89640",
                    borderRadius: 6, padding: "2px 8px", marginLeft: 8,
                  }}>Ready to Send</span>
                  <span className={`chevron ${openEmail ? "open" : ""}`}>▼</span>
                </div>
                {openEmail && (
                  <div className="section-card-body">
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, paddingTop: 8 }}>
                      <button
                        onClick={copyEmail}
                        style={{
                          padding: "10px 20px", background: copied ? "#00C896" : "var(--pink)",
                          color: "white", border: "none", borderRadius: 10,
                          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                          cursor: "pointer", transition: "background 0.2s",
                        }}
                      >
                        {copied ? "✓ Copied!" : "Copy to Clipboard"}
                      </button>
                    </div>
                    <div style={{
                      background: "white", border: "1.5px solid var(--border)",
                      borderRadius: 12, padding: "28px 32px", fontFamily: "Georgia, serif",
                      fontSize: 14, lineHeight: 1.9, color: "var(--text)",
                    }}>
                      <p style={{ margin: "0 0 16px" }}>Hi {results.prospectName || "there"},</p>
                      <p style={{ margin: "0 0 24px" }}>
                        It was great to connect with you today! You can review our call recording and below you'll find a collection of notes and resources based on our chat.
                      </p>

                      {/* Metric-based ROI callouts */}
                      {metricCallouts.length > 0 && (
                        <>
                          <p style={{ margin: "0 0 10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Based on Your Numbers</p>
                          <ul style={{ margin: "0 0 24px", paddingLeft: 20 }}>
                            {metricCallouts.map((callout, i) => (
                              <li key={i} style={{ marginBottom: 8 }}>{callout}</li>
                            ))}
                          </ul>
                        </>
                      )}

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
                      <p style={{ margin: 0 }}>{repName || "[Your name]"}</p>
                      {repEmail && <p style={{ margin: 0 }}>{repEmail}</p>}
                      {repPhone && <p style={{ margin: 0 }}>{repPhone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
