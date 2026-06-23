import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const types = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      value={value} exclusive size="small"
      onChange={(e, v) => { if (v !== null) onChange(v); }}
      sx={{
        flexWrap: "wrap", gap: 0.5, border: "none",
        "& .MuiToggleButtonGroup-grouped": {
          border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px !important", margin: "0 4px 4px 0"
        }
      }}
    >
      {types.map((t) => (
        <ToggleButton key={t} value={t} sx={{
          textTransform: "none", px: 2.5, py: 0.75, fontWeight: 600, transition: "all 0.2s",
          "&.Mui-selected": {
            backgroundColor: "primary.main", color: "primary.contrastText",
            "&:hover": { backgroundColor: "primary.dark" }
          }
        }}>
          {t}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}