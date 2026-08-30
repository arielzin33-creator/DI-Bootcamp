import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useApp } from "../context/AppContext.jsx";

export default function Header() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Herolo Weather
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component={Link}
            to="/"
            color="inherit"
            variant={location.pathname === "/" ? "outlined" : "text"}
          >
            Home
          </Button>

          <Button
            component={Link}
            to="/favorites"
            color="inherit"
            variant={location.pathname === "/favorites" ? "outlined" : "text"}
          >
            Favorites
          </Button>

          <Button
            color="inherit"
            onClick={() => dispatch({ type: "TOGGLE_UNITS" })}
            aria-label="Toggle temperature units"
          >
            &deg;{state.units === "C" ? "F" : "C"}
          </Button>

          <IconButton
            color="inherit"
            onClick={() => dispatch({ type: "TOGGLE_THEME" })}
            aria-label="Toggle dark mode"
          >
            {state.theme === "light" ? (
              <Brightness4Icon />
            ) : (
              <Brightness7Icon />
            )}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
