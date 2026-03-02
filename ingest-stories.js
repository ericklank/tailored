// api/ingest-stories.js - Ingest customer stories into Pinecone

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { stories } = req.body;
  if (!stories?.length) return res.status(400).json({ error: "No stories provided" });

  try {
    const records = [];

    for (const story of stories) {
      // Support both Apify Web Scraper and manual JSON formats
      const title = story.title || story.name || "";
      const url = story.url || story.canonicalUrl || "";
      const body = story.text || story.body || story.content || story.markdown || "";
      const id = `story_${story.url?.split("/").filter(Boolean).pop() || Math.random().toString(36).slice(2)}`;

      const text = [title, body].filter(Boolean).join("\n\n").slice(0, 2000);
      if (text.length < 50) continue;

      records.push({ _id: id, text, title, url, type: "customer_story" });
    }

    if (records.length === 0) return res.status(200).json({ processed: 0, message: "No valid stories" });

    // Upsert to Pinecone using integrated embedding
    const upsertRes = await fetch(`${PINECONE_HOST}/records/namespaces/stories/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY,
        "X-Pinecone-API-Version": "2025-04",
      },
      body: JSON.stringify({ records }),
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      console.error("Pinecone upsert error:", err);
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ processed: records.length });
  } catch (err) {
    console.error("Ingest stories error:", err);
    return res.status(500).json({ error: err.message });
  }
}
