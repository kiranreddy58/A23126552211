import { useState } from "react";
import {
  Alert, Badge, Box, CircularProgress, Divider, Pagination, Stack, Typography, Paper
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Log from "../../../logging/logger.js";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";

export function NotificationsPage({ readIds, onToggleRead }) {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const { notifications, totalPages, loading, error } = useNotifications(page, filter);

  const unread = notifications.filter((n) => !readIds.includes(n.ID)).length;

  const changeFilter = async (f) => {
    setFilter(f);
    setPage(1);
    await Log("frontend", "info", "page", "filter: " + f);
  };

  const changePage = async (_, p) => {
    setPage(p);
    await Log("frontend", "info", "page", "page: " + p);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
        <Badge badgeContent={unread} color="error" max={99}>
          <NotificationsIcon sx={{ fontSize: 28, color: "primary.main" }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Browse and manage notifications. Use filters to refine by type.
      </Typography>

      <Box mb={3}><NotificationFilter value={filter} onChange={changeFilter} /></Box>
      <Divider sx={{ mb: 3 }} />

      {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}

      {!loading && error && <Alert severity="error" sx={{ borderRadius: "8px" }}>Failed to load: {error}</Alert>}

      {!loading && !error && notifications.length === 0 && (
        <Paper variant="outlined" sx={{ py: 6, px: 2, textAlign: "center", borderRadius: "12px", borderStyle: "dashed" }}>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>No notifications found.</Typography>
        </Paper>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={2}>
          {notifications.map((n) => (
            <NotificationCard key={n.ID} notification={n} isRead={readIds.includes(n.ID)} onToggleRead={onToggleRead} />
          ))}
        </Stack>
      )}

      {!loading && !error && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={changePage} color="primary" shape="rounded" />
        </Box>
      )}
    </Box>
  );
}
