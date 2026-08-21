import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import "./index.css";
import App from "./App.jsx";
import { theme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyle";
import { I18nProvider } from "./i18n/I18nContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <I18nProvider>
        <ToastProvider>
          <CartProvider>
            {/* HashRouter: the deployment target for a static bundle like this
                (e.g. GitHub Pages) has no server-side rewrite, so a direct
                load of /cart would 404 under BrowserRouter. */}
            <HashRouter>
              <App />
            </HashRouter>
          </CartProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>
);
