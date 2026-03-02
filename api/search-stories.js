// api/search-stories.js - Search customer stories from Pinecone

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const searchRes = await fetch(`${PINECONE_HOST}/records/namespaces/stories/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY,
        "X-Pinecone-API-Version": "2025-04",
      },
      body: JSON.stringify({
        query: { inputs: { text: query }, top_k: 3 },
        fields: ["title", "url", "text"],
      }),
    });

    if (!searchRes.ok) {
      const err = await searchRes.text();
      return res.status(500).json({ error: err });
    }

    const data = await searchRes.json();
    const stories = (data.result?.hits || [])
      .filter(h => (h._score || 0) > 0.3)
      .map(h => ({
        title: h.fields?.title || "",
        url: h.fields?.url || "",
        excerpt: h.fields?.text?.slice(0, 150) || "",
        score: h._score,
      }));

    return res.status(200).json({ stories });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
