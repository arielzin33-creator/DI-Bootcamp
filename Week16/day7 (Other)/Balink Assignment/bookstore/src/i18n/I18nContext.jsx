import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { translations } from "./translations";

const I18nContext = createContext(null);

const STORAGE_KEY = "bookstore-lang";

function detectInitialLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language?.slice(0, 2);
  return translations[browserLang] ? browserLang : "en";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);

  const setLang = useCallback((nextLang) => {
    setLangState(nextLang);
    localStorage.setItem(STORAGE_KEY, nextLang);
  }, []);

  const t = useCallback(
    (key, vars = {}) => {
      const template = translations[lang][key] ?? translations.en[key] ?? key;
      return Object.entries(vars).reduce(
        (result, [varName, value]) => result.replaceAll(`{${varName}}`, value),
        template
      );
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
