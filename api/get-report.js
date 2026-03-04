import { createClient } from "redis";

async function getRedis() {
  const client = createClient({ url: process.env.tailored_REDIS_URL });
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "No report ID" });

  let redis;
  try {
    redis = await getRedis();
    const data = await redis.get(`report:${id}`);
    await redis.quit();
    if (!data) return res.status(404).json({ error: "Report not found or expired" });
    res.status(200).json({ report: JSON.parse(data) });
  } catch (err) {
    if (redis) try { await redis.quit(); } catch {}
    console.error("get-report error:", err);
    res.status(500).json({ error: err.message });
  }
}
