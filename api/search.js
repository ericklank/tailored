// api/search.js - Vercel Serverless Function
// Queries Pinecone for support articles relevant to a given query

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

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
      parameters: { input_type: "query" },
    }),
  });

  const data = await res.json();
  return data?.data?.[0]?.values;
}

async function queryPinecone(embedding, topK = 4) {
  const res = await fetch(`${PINECONE_HOST}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PINECONE_API_KEY,
    },
    body: JSON.stringify({
      vector: embedding,
      topK,
      includeMetadata: true,
    }),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const embedding = await getEmbedding(query);
    if (!embedding) throw new Error("Failed to generate embedding");

    const results = await queryPinecone(embedding);
    const articles = (results.matches || [])
      .filter((m) => m.score > 0.5)
      .map((m) => ({
        title: m.metadata.title,
        url: m.metadata.url,
        excerpt: m.metadata.text,
        score: m.score,
      }));

    return res.status(200).json({ articles });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: err.message });
  }
}
