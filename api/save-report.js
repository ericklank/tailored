import { createClient } from 'redis';
import { randomBytes } from 'crypto';

const REPORT_TTL = 60 * 60 * 24 * 30;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let client;
  try {
    let report = req.body;
    if (typeof report === 'string') report = JSON.parse(report);
    if (!report || (!report.results && !report.prospectName)) {
      return res.status(400).json({ error: 'No report data' });
    }

    client = createClient({ url: process.env.tailored_REDIS_URL });
    await client.connect();

    const id = randomBytes(4).toString('hex');
    await client.setEx(`report:${id}`, REPORT_TTL, JSON.stringify(report));
    await client.disconnect();

    return res.status(200).json({ id, url: `https://tailored-zeta.vercel.app/report/${id}` });
  } catch (err) {
    if (client) await client.disconnect().catch(() => {});
    console.error('save-report error:', err);
    return res.status(500).json({ error: err.message });
  }
}
