import {
  Card, CardContent, Typography, Box, IconButton, Chip, Tooltip
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import DraftsIcon from "@mui/icons-material/Drafts";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";

function typeConfig(type) {
  switch ((type || "").toLowerCase()) {
    case "placement":
      return { color: "#0288d1", bg: "rgba(2,136,209,0.08)", icon: <WorkIcon sx={{ color: "#0288d1" }} />, label: "Placement" };
    case "result":
      return { color: "#7b1fa2", bg: "rgba(123,31,162,0.08)", icon: <SchoolIcon sx={{ color: "#7b1fa2" }} />, label: "Result" };
    case "event":
      return { color: "#e65100", bg: "rgba(230,81,0,0.08)", icon: <EventIcon sx={{ color: "#e65100" }} />, label: "Event" };
    default:
      return { color: "#455a64", bg: "rgba(69,90,100,0.08)", icon: <EventIcon sx={{ color: "#455a64" }} />, label: type };
  }
}

function fmtDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts.replace(/-/g, "/")).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true
    });
  } catch { return ts; }
}

export function NotificationCard({ notification, isRead, onToggleRead }) {
  const { ID, Type, Message, Timestamp } = notification;
  const cfg = typeConfig(Type);

  return (
    <Card
      elevation={isRead ? 1 : 3}
      sx={{
        position: "relative", borderRadius: "12px", borderLeft: `6px solid ${cfg.color}`,
        backgroundColor: isRead ? "background.paper" : "rgba(255,255,255,0.96)",
        transition: "all 0.25s", opacity: isRead ? 0.85 : 1,
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }
      }}
    >
      {!isRead && (
        <Box sx={{
          position: "absolute", top: 14, right: 14, width: 10, height: 10,
          borderRadius: "50%", backgroundColor: "#d32f2f", boxShadow: "0 0 8px #d32f2f"
        }} />
      )}
      <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2, pr: 5, "&:last-child": { pb: 2 } }}>
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44, borderRadius: "10px", backgroundColor: cfg.bg, flexShrink: 0
        }}>
          {cfg.icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
            <Chip label={cfg.label} size="small" sx={{
              height: 20, fontSize: "0.75rem", fontWeight: 600,
              color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}22`
            }} />
            <Typography variant="caption" color="text.secondary">{fmtDate(Timestamp)}</Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: isRead ? 400 : 600, color: "text.primary", lineHeight: 1.4 }}>
            {Message}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0, alignSelf: "center" }}>
          <Tooltip title={isRead ? "Mark as Unread" : "Mark as Read"}>
            <IconButton onClick={() => onToggleRead(ID)} size="small"
              sx={{ color: isRead ? "text.secondary" : "primary.main" }}>
              {isRead ? <MarkEmailUnreadIcon fontSize="small" /> : <DraftsIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
