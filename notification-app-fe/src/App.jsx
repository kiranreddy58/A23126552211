import { useState, useEffect } from "react";
import {
  ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar,
  Typography, Tabs, Tab, Container, Button
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import Log from "../../logging/logger.js";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityInboxPage } from "./pages/PriorityInboxPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: { default: "#f5f5f5", paper: "#ffffff" }
  },
  typography: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" }
});

export default function App() {
  const [view, setView] = useState("all");
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("read_ids") || "[]"); }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem("read_ids", JSON.stringify(readIds)); }, [readIds]);

  const toggleRead = async (id) => {
    const next = readIds.includes(id) ? readIds.filter((x) => x !== id) : [...readIds, id];
    setReadIds(next);
    await Log("frontend", "info", "state", "toggled " + id);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppBar position="sticky" elevation={1}>
          <Container maxWidth="md">
            <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <NotificationsIcon />
                <Typography variant="h6" fontWeight={700}>Campus Notifications</Typography>
              </Box>
              <Tabs value={view} onChange={(e, v) => setView(v)} textColor="inherit" indicatorColor="secondary" sx={{ minHeight: 64 }}>
                <Tab value="all" label="All Alerts" icon={<NotificationsIcon fontSize="small" />} iconPosition="start" sx={{ textTransform: "none", minHeight: 64 }} />
                <Tab value="priority" label="Priority Inbox" icon={<StarIcon fontSize="small" />} iconPosition="start" sx={{ textTransform: "none", minHeight: 64 }} />
              </Tabs>
              <Button variant="outlined" size="small" onClick={() => setReadIds([])} sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>
                Reset Read
              </Button>
            </Toolbar>
          </Container>
        </AppBar>

        <Box sx={{ flexGrow: 1, py: 4, px: 2 }}>
          <Container maxWidth="md">
            {view === "all"
              ? <NotificationsPage readIds={readIds} onToggleRead={toggleRead} />
              : <PriorityInboxPage readIds={readIds} onToggleRead={toggleRead} />}
          </Container>
        </Box>

        <Box component="footer" sx={{ py: 3, px: 2, mt: "auto", backgroundColor: "background.paper", borderTop: "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
          <Container maxWidth="md">
            <Typography variant="body2" color="text.secondary">
              Campus Notification System
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}