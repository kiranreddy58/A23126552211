import Log, { getOrFetchToken } from "../../../logging/logger.js";

const BASE = "/evaluation-service";

export async function fetchNotifications({ page = 1, limit = 10, type = "All" }) {
  try {
    const t = await getOrFetchToken();
    const params = new URLSearchParams({ page, limit });
    if (type && type !== "All") params.append("notification_type", type);

    const res = await fetch(`${BASE}/notifications?${params}`, {
      headers: { Authorization: "Bearer " + t, Accept: "application/json" }
    });

    if (!res.ok) {
      await Log("frontend", "error", "api", "fetch failed " + res.status);
      throw new Error("fetch failed: " + res.statusText);
    }

    const data = await res.json();
    await Log("frontend", "info", "api", "fetched " + (data.notifications?.length || 0) + " items");
    return data;
  } catch (e) {
    await Log("frontend", "error", "api", "error: " + e.message);
    throw e;
  }
}

export async function fetchAllNotifications() {
  try {
    const t = await getOrFetchToken();
    const results = await Promise.all(
      [1, 2, 3, 4, 5].map(async (p) => {
        const res = await fetch(`${BASE}/notifications?limit=10&page=${p}`, {
          headers: { Authorization: "Bearer " + t, Accept: "application/json" }
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const d = await res.json();
        return d.notifications || [];
      })
    );

    const seen = new Map();
    results.flat().forEach((n) => {
      if (n && n.ID) seen.set(n.ID, n);
    });

    const list = Array.from(seen.values());
    await Log("frontend", "info", "api", "pool: " + list.length + " items");
    return list;
  } catch (e) {
    await Log("frontend", "error", "api", "pool error: " + e.message);
    throw e;
  }
}
