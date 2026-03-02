// api/crawl.js - Vercel Serverless Function
// Crawls support.teamtailor.com and stores embeddings in Pinecone
// Runs on a weekly cron schedule via vercel.json

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

const SITEMAP_URL = "https://support.teamtailor.com/sitemap.xml";

async function fetchSitemap() {
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((m) => m[1])
    .filter((url) => url.includes("/en/") && !url.endsWith("/en/"));
  return urls.slice(0, 150); // cap at 150 articles to stay within limits
}

async function fetchArticle(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
      : "";

    // Extract main content - try article body first, fall back to main
    const bodyMatch =
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    let text = "";
    if (bodyMatch) {
      text = bodyMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2000); // keep chunks manageable
    }

    if (!text || text.length < 100) return null;
    return { url, title, text };
  } catch {
    return null;
  }
}

async function getEmbedding(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-text-embed-v2",
      input: text.slice(0, 3000),
    }),
  });

  // Use Pinecone's inference API instead (works with llama-text-embed-v2)
  const pineconeRes = await fetch(
    "https://api.pinecone.io/embed",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-text-embed-v2",
        inputs: [{ text: text.slice(0, 3000) }],
        parameters: { input_type: "passage" },
      }),
    }
  );

  const data = await pineconeRes.json();
  return data?.data?.[0]?.values;
}

async function upsertToPinecone(vectors) {
  const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PINECONE_API_KEY,
    },
    body: JSON.stringify({ vectors }),
  });
  return res.json();
}

export default async function handler(req, res) {
  // Verify this is called by Vercel Cron or manually with secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Starting crawl of Teamtailor support site...");
    const urls = await fetchSitemap();
    console.log(`Found ${urls.length} URLs to crawl`);

    let processed = 0;
    let failed = 0;
    const batchSize = 10;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const articles = await Promise.all(batch.map(fetchArticle));
      const valid = articles.filter(Boolean);

      const vectors = [];
      for (const article of valid) {
        const embedding = await getEmbedding(
          `${article.title}\n\n${article.text}`
        );
        if (!embedding) continue;

        vectors.push({
          id: Buffer.from(article.url).toString("base64").slice(0, 64),
          values: embedding,
          metadata: {
            url: article.url,
            title: article.title,
            text: article.text.slice(0, 500),
          },
        });
      }

      if (vectors.length > 0) {
        await upsertToPinecone(vectors);
        processed += vectors.length;
      }
      failed += batch.length - valid.length;

      // Small delay to be polite to the server
      await new Promise((r) => setTimeout(r, 500));
    }

    return res.status(200).json({
      success: true,
      processed,
      failed,
      total: urls.length,
    });
  } catch (err) {
    console.error("Crawl error:", err);
    return res.status(500).json({ error: err.message });
  }
}
