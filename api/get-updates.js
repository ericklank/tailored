import { createClient } from "redis";

const CACHE_KEY = "teamtailor_updates";
const CACHE_TTL = 60 * 60 * 24 * 14; // 2 weeks in seconds

async function getRedis() {
  const client = createClient({ url: process.env.tailored_REDIS_URL });
  await client.connect();
  return client;
}

async function fetchUpdates() {
  const res = await fetch("https://updates.teamtailor.com/", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Tailored/1.0)" },
  });
  const html = await res.text();

  // Parse update entries from the changelog HTML
  const updates = [];
  const entryRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  const titleRegex = /<h[123][^>]*>([\s\S]*?)<\/h[123]>/i;
  const dateRegex = /<time[^>]*>([\s\S]*?)<\/time>/i;
  const bodyRegex = /<p[^>]*>([\s\S]*?)<\/p>/i;

  let match;
  while ((match = entryRegex.exec(html)) !== null && updates.length < 10) {
    const block = match[1];
    const titleMatch = titleRegex.exec(block);
    const dateMatch = dateRegex.exec(block);
    const bodyMatch = bodyRegex.exec(block);
    if (titleMatch) {
      updates.push({
        title: titleMatch[1].replace(/<[^>]+>/g, "").trim(),
        date: dateMatch ? dateMatch[1].replace(/<[^>]+>/g, "").trim() : "",
        excerpt: bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 200) : "",
        url: "https://updates.teamtailor.com/",
      });
    }
  }

  // Fallback: try alternative selectors if article tags not found
  if (updates.length === 0) {
    const altRegex = /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    while ((match = altRegex.exec(html)) !== null && updates.length < 10) {
      const block = match[1];
      const titleMatch = titleRegex.exec(block);
      const bodyMatch = bodyRegex.exec(block);
      if (titleMatch) {
        updates.push({
          title: titleMatch[1].replace(/<[^>]+>/g, "").trim(),
          date: "",
          excerpt: bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 200) : "",
          url: "https://updates.teamtailor.com/",
        });
      }
    }
  }

  return updates;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  let redis;
  try {
    redis = await getRedis();

    // Check cache
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      await redis.quit();
      return res.status(200).json({ updates: JSON.parse(cached), cached: true });
    }

    // Fetch fresh
    const updates = await fetchUpdates();

    if (updates.length > 0) {
      await redis.set(CACHE_KEY, JSON.stringify(updates), { EX: CACHE_TTL });
    }

    await redis.quit();
    res.status(200).json({ updates, cached: false });
  } catch (err) {
    if (redis) try { await redis.quit(); } catch {}
    console.error("get-updates error:", err);
    res.status(500).json({ error: err.message });
  }
}
