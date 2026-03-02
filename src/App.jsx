import { useState, useCallback } from "react";

const SECTIONS = [
  {
    key: "currentSituation",
    label: "Current Situation",
    color: "#FF2D78",
    desc: "Where the prospect is today",
  },
  {
    key: "positiveOutcomes",
    label: "Positive Outcomes",
    color: "#00C896",
    desc: "What they stand to gain",
  },
  {
    key: "objectionsRaised",
    label: "Objections Raised",
    color: "#FF8C42",
    desc: "Concerns and blockers",
  },
  {
    key: "recommendedNextSteps",
    label: "Recommended Next Steps",
    color: "#6C63FF",
    desc: "How to move the deal forward",
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
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");
  const [importing, setImporting] = useState(false);

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
    if (!file || !apiKey) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const base64 = await toBase64(file);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: `You are a sales intelligence analyst for Teamtailor, an ATS platform. Analyze the provided sales call transcript and return ONLY a JSON object with exactly these four keys: currentSituation, positiveOutcomes, objectionsRaised, recommendedNextSteps.

Rules:
- currentSituation: 3-5 bullets describing the prospect's current pain points and situation
- positiveOutcomes: 3-8 bullets mapping SPECIFIC Teamtailor features discussed in the call to the prospect's pain points. Format each as: "[Feature Name] — [how it solves their specific problem]". Only include features actually mentioned or demoed in the call. Be specific and outcome-focused, not generic.
- objectionsRaised: 3-5 bullets of concerns or blockers the prospect raised
- recommendedNextSteps: 3-5 bullets of concrete next actions to move the deal forward

Each key should contain an array of strings. No preamble, no markdown, just raw JSON.`,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: "Analyze this sales call transcript and return the JSON summary.",
                },
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
      setResults(parsed);

      // Search for relevant support articles based on objections + situation
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
      } catch {
        // Articles are optional, don't fail the whole analysis
      }
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

          {!loading && !results && (
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

              <div className="api-row">
                <span className="api-label">API Key</span>
                <input
                  type="password"
                  className="api-input"
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              {error && <div className="error-box">⚠ {error}</div>}

              <button
                className="analyze-btn"
                disabled={!file || !apiKey}
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
                  <div className="section-card" key={s.key}>
                    <div className="section-header">
                      <div className="section-pip" style={{ background: s.color }} />
                      <span className="section-title">{s.label}</span>
                    </div>
                    <ul className="section-items">
                      {(results[s.key] || []).map((item, i) => (
                        <li className="section-item" key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <button className="reset-btn" onClick={() => { setResults(null); setFile(null); setArticles([]); }}>
                ← Analyze another call
              </button>

              {articles.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 2,
                    textTransform: "uppercase", color: "var(--text-muted)",
                    marginBottom: 14
                  }}>
                    Relevant Support Articles
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {articles.map((a, i) => (
                      <a
                        key={i}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          padding: "14px 18px",
                          background: "var(--surface)",
                          border: "1.5px solid var(--border)",
                          borderRadius: 10,
                          textDecoration: "none",
                          transition: "border-color 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--pink)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--pink)", marginBottom: 4 }}>
                          {a.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                          {a.excerpt?.slice(0, 120)}...
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
