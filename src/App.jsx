import { useState, useCallback } from "react";

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
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);

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
    else { tier = "2,000+"; price = "custom pricing"; }
    return { tier, price };
  };

  const generatePlainEmail = (res) => {
    if (!res) return "";
    const name = res.prospectName || "there";
    const pricing = getPricingText(res.employeeCount);
    const outcomeLines = (res.positiveOutcomes || []).map(item => {
      const text = item.outcome || item;
      const url = item.article?.url;
      return url ? `• ${text} → ${url}` : `• ${text}`;
    }).join("\n");
    const pricingSection = pricing
      ? `\nPricing\nTeamtailor's pricing is based on headcount. With ${res.employeeCount} employees, you fall in the ${pricing.tier} employee range at ${pricing.price}/year. Implementation typically takes 30–60 days and you'll have a dedicated Customer Success Manager to support you throughout.\n`
      : "";
    return `Hi ${name},\n\nIt was great to connect with you today! You can review our call recording and below you'll find a collection of notes and resources based on our chat.\n\nPositive Outcomes with Teamtailor\n${outcomeLines}\n\nOther Resources\n• Teamtailor How-to Video Library — https://www.youtube.com/@teamtailor\n• Feature Library — https://www.teamtailor.com/features/\n• List of all AI capabilities — https://www.teamtailor.com/ai/${pricingSection}\n\nLet me know if you have any questions, thoughts, or feedback. Happy to keep discussing and find the best path forward.\n\nBest,\n[Your name]`;
  };

 const copyEmail = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
    setLoading(true); setError(""); setResults(null);
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

      setResults({ ...parsed, positiveOutcomes: outcomesWithArticles, suggestedOutcomes: suggestedWithArticles });
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
              {error && <div className="error-box">⚠ {error}</div>}
              <button className="analyze-btn" disabled={!file} onClick={analyze}>Analyze Transcript</button>
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
                          marginLeft: "auto", fontSize: 11, fontWeight: 600, color: s.color,
                          background: `${s.color}15`, border: `1px solid ${s.color}40`,
                          borderRadius: 6, padding: "2px 8px",
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
                ))}
              </div>

              <button className="reset-btn" onClick={() => { setResults(null); setFile(null); }}>
                ← Analyze another call
              </button>

              <div style={{ marginTop: 16, marginBottom: 60 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>📧 Follow-up Email</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Ready to send — copy and paste into your email client</div>
                  </div>
                  <button
                    onClick={=>copyEmail}
                    style={{
                      padding: "10px 20px", background: copied ? "#00C896" : "var(--pink)",
                      color: "white", border: "none", borderRadius: 10,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap",
                    }}
                  >
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
                  <p style={{ margin: 0 }}>[Your name]</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
