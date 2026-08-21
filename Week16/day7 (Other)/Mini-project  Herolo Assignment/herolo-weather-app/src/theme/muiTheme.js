import { createTheme } from "@mui/material/styles";

export function buildTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: "#3f7fe0" },
      secondary: { main: "#ff8a3d" },
      ...(mode === "light"
        ? { background: { default: "#f2f5fb", paper: "#ffffff" } }
        : { background: { default: "#10141c", paper: "#181d29" } }),
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: ['"Segoe UI"', "system-ui", "-apple-system", "sans-serif"].join(","),
    },
  });
}
