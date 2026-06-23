import { useState, useEffect } from "react";
import {
  Alert, Badge, Box, CircularProgress, Divider, MenuItem, Select,
  Stack, Typography, FormControl, InputLabel, Paper
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import Log from "../../../logging/logger.js";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { fetchAllNotifications } from "../api/notifications";

const WEIGHTS = { placement: 3, result: 2, event: 1 };

export function PriorityInboxPage({ readIds, onToggleRead }) {
  const [limitN, setLimitN] = useState(10);
  const [filter, setFilter] = useState("All");
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Log("frontend", "info", "page", "loading priority inbox");
      const list = await fetchAllNotifications();
      setRaw(list);
      await Log("frontend", "info", "page", "pool: " + list.length);
    } catch (e) {
      setError(e.message || "failed to load");
      await Log("frontend", "error", "page", "error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  let unread = raw.filter((n) => !readIds.includes(n.ID));
  if (filter !== "All") unread = unread.filter((n) => n.Type?.toLowerCase() === filter.toLowerCase());

  const sorted = [...unread].sort((a, b) => {
    const wa = WEIGHTS[a.Type?.toLowerCase()] || 0;
    const wb = WEIGHTS[b.Type?.toLowerCase()] || 0;
    if (wa !== wb) return wb - wa;
    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });

  const shown = sorted.slice(0, limitN);

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
        <Badge badgeContent={sorted.length} color="error" max={99}>
          <StarIcon sx={{ fontSize: 28, color: "#ffb300" }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>Priority Inbox</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Top unread notifications by urgency (Placement &gt; Result &gt; Event) and recency.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} mb={3}>
        <Box sx={{ flexGrow: 1 }}><NotificationFilter value={filter} onChange={(f) => setFilter(f)} /></Box>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Show Top N</InputLabel>
          <Select value={limitN} label="Show Top N" onChange={(e) => setLimitN(Number(e.target.value))} sx={{ borderRadius: "8px" }}>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
            <MenuItem value={30}>Top 30</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
      {!loading && error && <Alert severity="error" sx={{ borderRadius: "8px" }}>Failed to load: {error}</Alert>}

      {!loading && !error && shown.length === 0 && (
        <Paper variant="outlined" sx={{ py: 6, px: 2, textAlign: "center", borderRadius: "12px", borderStyle: "dashed" }}>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            {unread.length === 0 ? "All caught up! No unread notifications." : "No matching notifications."}
          </Typography>
        </Paper>
      )}

      {!loading && !error && shown.length > 0 && (
        <Stack spacing={2}>
          {shown.map((n) => (
            <NotificationCard key={n.ID} notification={n} isRead={readIds.includes(n.ID)} onToggleRead={onToggleRead} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
