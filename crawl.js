// api/crawl.js - Vercel Serverless Function
// Crawls support.teamtailor.com by fetching known article URLs directly

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = "https://support.teamtailor.com";

// Seed URLs - known article IDs from the Teamtailor support site
// The crawler will also discover more articles from "Related Articles" links
const SEED_ARTICLES = [
  "/en/articles/8000456-get-started-with-teamtailor",
  "/en/articles/1199288-log-in-to-teamtailor",
  "/en/articles/9564553-chat-with-our-support-team",
  "/en/articles/7176287-team-stories",
  "/en/articles/7890885-finance-faq",
  "/en/articles/9424192-co-pilot-candidate-suggestions",
  "/en/articles/8068954-company-webhooks",
  "/en/articles/3527032-collect-permissions",
  "/en/articles/3461401-overview-recruitment-reports",
  "/en/articles/9545972-video-candidate-card",
];

// Fetch an article and extract text + related article links
async function scrapeArticle(path) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TailoredBot/1.0)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // Extract article content
    let text = "";
    const patterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /class="[^"]*intercom-interblocks[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        text = match[1]
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<nav[\s\S]*?<\/nav>/gi, "")
          .replace(/<header[\s\S]*?<\/header>/gi, "")
          .replace(/<footer[\s\S]*?<\/footer>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (text.length > 100) break;
      }
    }

    // Discover related article links
    const relatedLinks = [...html.matchAll(/href="(\/en\/articles\/[^"]+)"/g)]
      .map(m => m[1]);

    if (!title && text.length < 50) return null;

    return {
      url,
      title: title || path.split("/").pop().replace(/-/g, " "),
      text: text.slice(0, 2500),
      relatedLinks: [...new Set(relatedLinks)],
    };
  } catch (e) {
    console.error(`Failed to scrape ${url}:`, e.message);
    return null;
  }
}

async function getEmbedding(text) {
  const res = await fetch("https://api.pinecone.io/embed", {
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
  });
  const data = await res.json();
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
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // BFS crawl starting from seed articles, discover more via related links
    const visited = new Set();
    const queue = [...SEED_ARTICLES];
    let processed = 0;

    while (queue.length > 0 && visited.size < 150) {
      const batch = queue.splice(0, 5);
      const newBatch = batch.filter(u => !visited.has(u));
      if (newBatch.length === 0) continue;
      newBatch.forEach(u => visited.add(u));

      const articles = (await Promise.all(newBatch.map(scrapeArticle))).filter(Boolean);

      // Add newly discovered related links to queue
      for (const article of articles) {
        for (const link of (article.relatedLinks || [])) {
          if (!visited.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }
      }

      // Embed and upsert
      const vectors = [];
      for (const article of articles) {
        const embedding = await getEmbedding(`${article.title}\n\n${article.text}`);
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
        console.log(`Processed ${processed} articles, ${queue.length} remaining in queue`);
      }

      await new Promise(r => setTimeout(r, 600));
    }

    return res.status(200).json({ success: true, processed, visited: visited.size });
  } catch (err) {
    console.error("Crawl error:", err);
    return res.status(500).json({ error: err.message });
  }
}
