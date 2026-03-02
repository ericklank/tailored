// api/ingest.js - One-time ingestion endpoint
// POST with your articles JSON to push everything into Pinecone

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

async function getEmbedding(text) {
  const res = await fetch("https://api.pinecone.io/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PINECONE_API_KEY,
      "X-Pinecone-API-Version": "2025-01",
    },
    body: JSON.stringify({
      model: "llama-text-embed-v2",
      inputs: [{ text: text.slice(0, 3000) }],
      parameters: { input_type: "passage", truncate: "END" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone embed error: ${err}`);
  }

  const data = await res.json();
  return data?.data?.[0]?.values;
}

async function upsertBatch(vectors) {
  const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PINECONE_API_KEY,
    },
    body: JSON.stringify({ vectors }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone upsert error: ${err}`);
  }
  return res.json();
}

function cleanText(article) {
  const body = (article.body || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${article.title}\n\n${article.description || ""}\n\n${body}`.slice(0, 3000);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const articles = req.body.articles;
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: "Missing articles array in body" });
    }

    console.log(`Ingesting ${articles.length} articles...`);

    let processed = 0;
    let failed = 0;
    const batchSize = 5;

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      const vectors = [];

      for (const article of batch) {
        try {
          const text = cleanText(article);
          if (text.length < 50) continue;

          const embedding = await getEmbedding(text);
          if (!embedding) continue;

          vectors.push({
            id: article.articleId || Buffer.from(article.url).toString("base64").slice(0, 64),
            values: embedding,
            metadata: {
              url: article.url || "",
              title: article.title || "",
              text: text.slice(0, 500),
            },
          });
        } catch (e) {
          console.error(`Failed article ${article.articleId}:`, e.message);
          failed++;
        }
      }

      if (vectors.length > 0) {
        await upsertBatch(vectors);
        processed += vectors.length;
        console.log(`Progress: ${processed}/${articles.length}`);
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    return res.status(200).json({ success: true, processed, failed, total: articles.length });
  } catch (err) {
    console.error("Ingest error:", err);
    return res.status(500).json({ error: err.message });
  }
}
