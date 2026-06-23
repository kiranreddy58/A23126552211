import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  }
} catch (e) {
  console.error("env load error:", e.message);
}

import Log, { getOrFetchToken } from "../logging/logger.js";

const WEIGHTS = { placement: 3, result: 2, event: 1 };

function prioritize(list, n = 10) {
  return [...list]
    .sort((a, b) => {
      const wa = WEIGHTS[a.Type?.toLowerCase()] || 0;
      const wb = WEIGHTS[b.Type?.toLowerCase()] || 0;
      if (wa !== wb) return wb - wa;
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    })
    .slice(0, n);
}

async function run() {
  try {
    await Log("backend", "info", "cron_job", "priority inbox started");

    const t = await getOrFetchToken();
    if (!t) throw new Error("no token");

    console.log("fetching notifications...");
    const pages = [1, 2, 3, 4, 5];
    const results = await Promise.all(
      pages.map(async (p) => {
        const res = await fetch(
          `http://4.224.186.213/evaluation-service/notifications?limit=10&page=${p}`,
          { headers: { Authorization: "Bearer " + t } }
        );
        if (!res.ok) throw new Error("page " + p + " failed: " + res.status);
        const d = await res.json();
        return d.notifications || [];
      })
    );

    const seen = new Map();
    results.flat().forEach((n) => {
      if (n && n.ID) seen.set(n.ID, n);
    });

    const all = Array.from(seen.values());
    await Log("backend", "info", "service", "fetched " + all.length + " notifications");

    const top10 = prioritize(all, 10);

    console.log("\n=== All Notifications (up to 10) ===");
    console.table(all.slice(0, 10));

    console.log("\n=== Top 10 Priority Inbox ===");
    console.table(top10);

    await Log("backend", "info", "cron_job", "priority inbox done");
  } catch (e) {
    console.error("error:", e.message);
    await Log("backend", "error", "service", "inbox error: " + e.message);
  }
}

run();
