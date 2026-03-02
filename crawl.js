// api/crawl.js - Vercel Serverless Function
// Crawls support.teamtailor.com using collection/article scraping

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = "https://support.teamtailor.com";

async function scrapeCollectionLinks() {
  const res = await fetch(`${BASE_URL}/en/`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TailoredBot/1.0)" },
  });
  const html = await res.text();
  const urls = [...html.matchAll(/href="(\/en\/collections\/[^"]+)"/g)]
    .map((m) => `${BASE_URL}${m[1]}`);
  return [...new Set(urls)];
}

async function scrapeArticleLinks(collectionUrl) {
  try {
    const res = await fetch(collectionUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TailoredBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const urls = [...html.matchAll(/href="(\/en\/articles\/[^"]+)"/g)]
      .map((m) => `${BASE_URL}${m[1]}`);
    return [...new Set(urls)];
  } catch { return []; }
}

async function scrapeArticle(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TailoredBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    let text = "";
    const bodyMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    if (bodyMatch) {
      text = bodyMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (!title && text.length < 50) return null;
    return { url, title: title || url.split("/").pop().replace(/-/g, " "), text: text.slice(0, 2500) };
  } catch { return null; }
}

async function getEmbedding(text) {
  const res = await fetch("https://api.pinecone.io/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Api-Key": PINECONE_API_KEY },
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
    headers: { "Content-Type": "application/json", "Api-Key": PINECONE_API_KEY },
    body: JSON.stringify({ vectors }),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const collectionUrls = await scrapeCollectionLinks();
    console.log(`Found ${collectionUrls.length} collections`);

    const allArticleUrls = [];
    for (const colUrl of collectionUrls) {
      const articles = await scrapeArticleLinks(colUrl);
      allArticleUrls.push(...articles);
      await new Promise((r) => setTimeout(r, 300));
    }

    const uniqueUrls = [...new Set(allArticleUrls)].slice(0, 200);
    console.log(`Found ${uniqueUrls.length} articles`);

    let processed = 0;
    for (let i = 0; i < uniqueUrls.length; i += 5) {
      const batch = uniqueUrls.slice(i, i + 5);
      const articles = (await Promise.all(batch.map(scrapeArticle))).filter(Boolean);

      const vectors = [];
      for (const article of articles) {
        const embedding = await getEmbedding(`${article.title}\n\n${article.text}`);
        if (!embedding) continue;
        vectors.push({
          id: Buffer.from(article.url).toString("base64").slice(0, 64),
          values: embedding,
          metadata: { url: article.url, title: article.title, text: article.text.slice(0, 500) },
        });
      }

      if (vectors.length > 0) {
        await upsertToPinecone(vectors);
        processed += vectors.length;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    return res.status(200).json({ success: true, processed, total: uniqueUrls.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
