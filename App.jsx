import { useState, useCallback } from "react";

const SECTIONS = [
  {
    key: "currentSituation",
    label: "Current Situation",
    color: "#FF2D78",
    span: 1,
  },
  {
    key: "positiveOutcomes",
    label: "Discussed in Call",
    color: "#00C896",
    span: 1,
  },
  {
    key: "suggestedOutcomes",
    label: "You Might Have Missed",
    color: "#FF8C42",
    span: 1,
    badge: "💡 AI Suggested",
  },
  {
    key: "objectionsRaised",
    label: "Objections Raised",
    color: "#E0294A",
    span: 1,
  },
  {
    key: "recommendedNextSteps",
    label: "Recommended Next Steps",
    color: "#6C63FF",
    span: 2,
  },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --pink: #FF2D78;
    --pink-light: #FF6BA8;
    --pink-pale: #FFF0F5;
    --pink-muted: rgba(255,45,120,0.08);
    --pink-border: rgba(255,45,120,0.2);
    --text: #1A1A2E;
    --text-muted: #7A7A9A;
    --bg: #FFFFFF;
    --surface: #F8F6FA;
    --border: #EDE8F2;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 0 48px;
    height: 64px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
  }

  .logo {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-dot {
    width: 28px;
    height: 28px;
    background: var(--pink);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: white;
  }

  .tagline {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 500;
  }

  .main {
    flex: 1;
    padding: 56px 48px;
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }

  .page-sub {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 36px;
    font-weight: 400;
  }

  .upload-zone {
    border: 2px dashed var(--pink-border);
    border-radius: 12px;
    padding: 56px 48px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--pink-muted);
    position: relative;
    overflow: hidden;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--pink);
    background: rgba(255,45,120,0.05);
  }

  .upload-icon {
    width: 52px;
    height: 52px;
    background: var(--pink);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin: 0 auto 16px;
  }

  .upload-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--text);
  }

  .upload-sub {
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 400;
  }

  .upload-sub strong {
    color: var(--pink);
    font-weight: 600;
  }

  .file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .file-selected {
    margin-top: 16px;
    padding: 14px 18px;
    background: var(--pink-pale);
    border: 1px solid var(--pink-border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .file-name {
    font-size: 13px;
    color: var(--pink);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .api-row {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .api-label {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    white-space: nowrap;
    font-weight: 600;
  }

  .api-input {
    flex: 1;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 11px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
  }

  .api-input::placeholder { color: #C0BAD0; }
  .api-input:focus { border-color: var(--pink); }

  .analyze-btn {
    margin-top: 20px;
    width: 100%;
    padding: 15px;
    background: var(--pink);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(255,45,120,0.3);
  }

  .analyze-btn:hover:not(:disabled) {
    background: #E0205E;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255,45,120,0.4);
  }

  .analyze-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .loading {
    text-align: center;
    padding: 100px 0;
  }

  .loading-ring {
    width: 44px;
    height: 44px;
    border: 3px solid var(--pink-border);
    border-top-color: var(--pink);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-text {
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
  }

  .loading-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 6px;
  }

  .results {
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .results-header {
    margin-bottom: 28px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .results-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .results-file {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .section-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 28px 24px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .section-card:hover {
    border-color: var(--pink-border);
    box-shadow: 0 4px 20px rgba(255,45,120,0.06);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1.5px solid var(--border);
  }

  .section-pip {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text);
  }

  .section-items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-item {
    font-size: 13.5px;
    color: #4A4A6A;
    line-height: 1.6;
    font-weight: 400;
    padding-left: 14px;
    position: relative;
  }

  .section-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 9px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--pink);
    opacity: 0.5;
  }

  .reset-btn {
    margin-top: 28px;
    padding: 10px 22px;
    background: transparent;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    border-color: var(--pink);
    color: var(--pink);
  }

  .error-box {
    margin-top: 14px;
    padding: 13px 16px;
    background: #FFF2F5;
    border: 1px solid #FFB3C6;
    border-radius: 10px;
    font-size: 13px;
    color: #C0103E;
    font-weight: 500;
  }

  @media (max-width: 700px) {
    .main { padding: 32px 20px; }
    .header { padding: 0 20px; }
    .grid { grid-template-columns: 1fr; }
  }
`;

export default function App() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");
  const [importing, setImporting] = useState(false);

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
    if (count <= 50) { tier = "1–50"; price = "$3,600"; }
    else if (count <= 100) { tier = "51–100"; price = "$4,800"; }
    else if (count <= 250) { tier = "101–250"; price = "$7,200"; }
    else if (count <= 400) { tier = "251–400"; price = "$10,800"; }
    else if (count <= 600) { tier = "401–600"; price = "$13,200"; }
    else if (count <= 1000) { tier = "601–1,000"; price = "$16,800"; }
    else if (count <= 2000) { tier = "1,001–2,000"; price = "$24,000"; }
    else { tier = "2,000+"; price = "custom"; }
    return { tier, price };
  };

  const generateEmail = (results, outcomesWithArticles) => {
    if (!results) return "";
    const name = results.prospectName || "there";
    const pricing = getPricingText(results.employeeCount);

    const outcomeLines = (outcomesWithArticles || results.positiveOutcomes || [])
      .map(item => {
        const text = item.outcome || item;
        const link = item.article?.url ? ` → ${item.article.url}` : "";
        return `• ${text}${link}`;
      }).join("\n");

    const pricingSection = pricing
      ? `\nPricing\nTeamtailor's pricing is based on headcount. With ${results.employeeCount} employees, you fall in the ${pricing.tier} employee range at ${pricing.price}/year. Implementation typically takes 30–60 days and you'll have a dedicated Customer Success Manager to support you throughout.\n`
      : "";

    return `Hi ${name},

It was great to connect with you today! You can review our call recording and below you'll find a collection of notes and resources based on our chat.

Positive Outcomes with Teamtailor
${outcomeLines}

Other Resources
• Teamtailor How-to Video Library — https://www.youtube.com/@teamtailor
• Feature Library — https://www.teamtailor.com/features/
• List of all AI capabilities — https://www.teamtailor.com/ai/
${pricingSection}
Let me know if you have any questions, thoughts, or feedback. Happy to keep discussing and find the best path forward.

Best,
[Your name]`;
  };

  const [copied, setCopied] = useState(false);
  const copyEmail = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError("");
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const toBase64 = (f) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const base64 = await toBase64(file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          system: `You are a sales intelligence analyst for Teamtailor, an ATS platform. Analyze the provided sales call transcript and return ONLY a JSON object with exactly these seven keys: prospectName, prospectCompany, employeeCount, currentSituation, positiveOutcomes, suggestedOutcomes, objectionsRaised, recommendedNextSteps.

Rules:
- prospectName: string, first name of the prospect (the person being sold to, not the sales rep)
- prospectCompany: string, name of the prospect's company
- employeeCount: number, the employee count mentioned in the call (use the total headcount discussed for pricing purposes, default to 0 if not mentioned)
- currentSituation: 3-5 bullets describing the prospect's current pain points and situation
- positiveOutcomes: 3-8 objects for features ACTUALLY DISCUSSED in the call. Each object has: "outcome" (string: "[Feature Name] — [how it solves their specific problem]") and "articleQuery" (string: 3-6 word search query to find the most relevant Teamtailor support article)
- suggestedOutcomes: 3-5 objects for Teamtailor features NOT discussed in the call but that would clearly benefit this prospect based on their situation, company size, industry, and pain points. Draw on your knowledge of ATS best practices. Each object has: "outcome" (string: "[Feature Name] — [why this would benefit them specifically]") and "articleQuery" (string: 3-6 word search query for the most relevant Teamtailor support article)
- objectionsRaised: 3-5 bullets of concerns or blockers the prospect raised
- recommendedNextSteps: 3-5 bullets of concrete next actions to move the deal forward

Each key should contain an array of strings except positiveOutcomes and suggestedOutcomes which are arrays of objects, and prospectName/prospectCompany/employeeCount which are primitives. No preamble, no markdown, just raw JSON.`,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: base64 },
                },
                { type: "text", text: "Analyze this sales call transcript and return the JSON summary." },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "API error");
      }

      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);

      // Fetch articles for both positiveOutcomes and suggestedOutcomes in parallel
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

      setResults({ ...parsed, positiveOutcomes: outcomesWithArticles, suggestedOutcomes: suggestedWithArticles });

      // Fetch general articles for sidebar
      try {
        const query = [
          ...(parsed.currentSituation || []),
          ...(parsed.objectionsRaised || []),
        ].join(" ");
        const searchRes = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          setArticles(searchData.articles || []);
        }
      } catch {}
    } catch (err) {
      setError(err.message || "Something went wrong. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const runCrawl = async () => {
    const secret = prompt("Enter your CRON_SECRET:");
    if (!secret) return;
    setCrawling(true);
    setCrawlStatus("Syncing articles...");
    try {
      const res = await fetch("/api/crawl", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCrawlStatus(`✓ Done! ${data.processed} articles indexed.`);
      } else {
        setCrawlStatus(`✗ Error: ${data.error}`);
      }
    } catch (err) {
      setCrawlStatus(`✗ Failed: ${err.message}`);
    } finally {
      setCrawling(false);
    }
  };

  const importArticles = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const secret = prompt("Enter your CRON_SECRET:");
    if (!secret) return;

    setImporting(true);
    setCrawlStatus("Importing articles...");

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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${secret}`,
          },
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
      setImporting(false);
      e.target.value = "";
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
            <label
              style={{
                padding: "7px 14px",
                background: importing ? "var(--surface)" : "var(--pink-muted)",
                border: "1.5px solid var(--pink-border)",
                borderRadius: 8,
                color: importing ? "var(--text-muted)" : "var(--pink)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: importing ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {importing ? "Importing..." : "↑ Import Articles"}
              <input
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={importArticles}
                disabled={importing}
              />
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

          {!loading && !results && !authed && (
            <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Welcome to Tailored</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>Enter your team password to get started</div>
              <input
                type="password"
                className="api-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", marginBottom: 12, textAlign: "center", fontSize: 16 }}
              />
              {authError && <div className="error-box" style={{ marginBottom: 12 }}>⚠ {authError}</div>}
              <button className="analyze-btn" onClick={handleLogin} disabled={!password}>
                Enter →
              </button>
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
                <input
                  type="file"
                  accept=".pdf"
                  className="file-input"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <div className="upload-icon">📄</div>
                <div className="upload-title">Drop your transcript here</div>
                <div className="upload-sub">
                  <strong>PDF format</strong> · Drag & drop or click to browse
                </div>
              </div>

              {file && (
                <div className="file-selected">
                  <span className="file-name">📄 {file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              )}

              {error && <div className="error-box">⚠ {error}</div>}

              <button
                className="analyze-btn"
                disabled={!file}
                onClick={analyze}
              >
                Analyze Transcript
              </button>
            </>
          )}

          {!loading && results && (
            <div className="results">
              <div className="results-header">
                <div className="results-title">Call Analysis</div>
                <div className="results-file">{file?.name}</div>
              </div>

              <div className="grid">
                {SECTIONS.map((s) => (
                  <div className="section-card" key={s.key} style={s.span === 2 ? { gridColumn: "1 / -1" } : {}}>
                    <div className="section-header">
                      <div className="section-pip" style={{ background: s.color }} />
                      <span className="section-title">{s.label}</span>
                      {s.badge && (
                        <span style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 600,
                          color: s.color,
                          background: `${s.color}15`,
                          border: `1px solid ${s.color}40`,
                          borderRadius: 6,
                          padding: "2px 8px",
                        }}>{s.badge}</span>
                      )}
                    </div>
                    <ul className="section-items">
                      {(results[s.key] || []).map((item, i) => {
                        if ((s.key === "positiveOutcomes" || s.key === "suggestedOutcomes") && item.outcome) {
                          return (
                            <li className="section-item" key={i}>
                              {item.outcome}
                              {item.article && (
                                <a
                                  href={item.article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    marginTop: 5,
                                    fontSize: 11,
                                    color: s.color,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    background: `${s.color}10`,
                                    border: `1px solid ${s.color}30`,
                                    borderRadius: 6,
                                    padding: "3px 8px",
                                  }}
                                >
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
                ))}
              </div>

              <button className="reset-btn" onClick={() => { setResults(null); setFile(null); setArticles([]); }}>
                ← Analyze another call
              </button>

              {/* Follow-up Email Section */}
              {(() => {
                const emailText = generateEmail(results, results.positiveOutcomes);
                return (
                  <div style={{ marginTop: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                          📧 Follow-up Email
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          Ready to send — copy and paste into your email client
                        </div>
                      </div>
                      <button
                        onClick={() => copyEmail(emailText)}
                        style={{
                          padding: "10px 20px",
                          background: copied ? "#00C896" : "var(--pink)",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "background 0.2s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {copied ? "✓ Copied!" : "Copy to Clipboard"}
                      </button>
                    </div>
                    <div style={{
                      background: "var(--surface)",
                      border: "1.5px solid var(--border)",
                      borderRadius: 14,
                      padding: "28px 32px",
                      fontFamily: "Georgia, serif",
                      fontSize: 14,
                      lineHeight: 1.8,
                      color: "var(--text)",
                      whiteSpace: "pre-wrap",
                    }}>
                      {emailText}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
