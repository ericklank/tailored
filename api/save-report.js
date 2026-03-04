import { createClient } from "redis";
import { randomBytes } from "crypto";

const REPORT_TTL = 60 * 60 * 24 * 90; // 90 days

async function getRedis() {
  const client = createClient({ url: process.env.tailored_REDIS_URL });
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { report, password } = req.body;
  if (!report) return res.status(400).json({ error: "No report data" });
  if (password !== process.env.APP_PASSWORD) return res.status(401).json({ error: "Unauthorized" });

  let redis;
  try {
    redis = await getRedis();
    const id = randomBytes(4).toString("hex"); // e.g. "a3f2c1d4"
    const key = `report:${id}`;
    await redis.set(key, JSON.stringify(report), { EX: REPORT_TTL });
    await redis.quit();
    res.status(200).json({ id, url: `${process.env.APP_URL || "https://tailored-zeta.vercel.app"}/report/${id}` });
  } catch (err) {
    if (redis) try { await redis.quit(); } catch {}
    console.error("save-report error:", err);
    res.status(500).json({ error: err.message });
  }
}
