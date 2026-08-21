import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import "./index.css";
import App from "./App.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {/* HashRouter: GitHub Pages serves static files with no server-side rewrite,
            so a direct load/refresh of /favorites would 404 under BrowserRouter. */}
        <HashRouter>
          <App />
        </HashRouter>
      </SnackbarProvider>
    </QueryClientProvider>
  </StrictMode>
);
