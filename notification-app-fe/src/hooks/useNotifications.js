import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/notifications";
import Log from "../../../logging/logger.js";

export function useNotifications(page = 1, filter = "All") {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      await Log("frontend", "info", "hook", "loading page " + page);
      const data = await fetchNotifications({ page, limit: 10, type: filter });
      setNotifications(data.notifications ?? []);
      setTotalCount(data.total || data.notifications?.length || 0);
      setTotalPages(data.totalPages || (data.notifications?.length === 10 ? page + 1 : page));
      await Log("frontend", "info", "hook", "loaded " + (data.notifications?.length || 0));
    } catch (err) {
      setError(err.message || "failed to load");
      await Log("frontend", "error", "hook", "error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filter]);

  return { notifications, totalPages, totalCount, loading, error, refetch: load };
}
