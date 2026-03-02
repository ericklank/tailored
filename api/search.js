// api/search.js - Uses Pinecone's inference search (handles embedding automatically)

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    // Use Pinecone's search_records endpoint which handles embedding automatically
    const res2 = await fetch(`${PINECONE_HOST}/records/namespaces/__default__/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY,
        "X-Pinecone-API-Version": "2025-04",
      },
      body: JSON.stringify({
        query: {
          inputs: { text: query },
          top_k: 3,
        },
        fields: ["title", "url", "text"],
      }),
    });

    if (!res2.ok) {
      const err = await res2.text();
      console.error("Pinecone search error:", err);
      return res.status(500).json({ error: err });
    }

    const data = await res2.json();
    console.log("Pinecone response:", JSON.stringify(data).slice(0, 300));

    const articles = (data.result?.hits || [])
      .filter((h) => (h._score || 0) > 0.3)
      .map((h) => ({
        title: h.fields?.title || "",
        url: h.fields?.url || "",
        excerpt: h.fields?.text || "",
        score: h._score,
      }));

    return res.status(200).json({ articles });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: err.message });
  }
}
