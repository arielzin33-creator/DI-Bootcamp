import { AppBar, Toolbar, Typography, Button, IconButton, Stack, ButtonGroup } from "@mui/material";
import { NavLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAppStore } from "../store/useAppStore";

export default function AppHeader() {
  const themeMode = useAppStore((state) => state.themeMode);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const unit = useAppStore((state) => state.unit);
  const toggleUnit = useAppStore((state) => state.toggleUnit);

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          🌤️ Herolo Weather
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            component={NavLink}
            to="/"
            end
            startIcon={<HomeIcon />}
            color="inherit"
            sx={{ "&.active": { fontWeight: 700, textDecoration: "underline" } }}
          >
            Home
          </Button>
          <Button
            component={NavLink}
            to="/favorites"
            startIcon={<StarIcon />}
            color="inherit"
            sx={{ "&.active": { fontWeight: 700, textDecoration: "underline" } }}
          >
            Favorites
          </Button>
        </Stack>

        <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: "background.paper" }}>
          <Button
            onClick={() => unit !== "C" && toggleUnit()}
            variant={unit === "C" ? "contained" : "outlined"}
          >
            °C
          </Button>
          <Button
            onClick={() => unit !== "F" && toggleUnit()}
            variant={unit === "F" ? "contained" : "outlined"}
          >
            °F
          </Button>
        </ButtonGroup>

        <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
          {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
