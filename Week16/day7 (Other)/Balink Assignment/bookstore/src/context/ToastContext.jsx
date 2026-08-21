import { createContext, useCallback, useContext, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const ToastContext = createContext(null);

const slideUp = keyframes`
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
`;

const ToastBar = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ $variant, theme }) =>
    $variant === "error" ? theme.colors.danger : theme.colors.text};
  color: #fff;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  font-size: 0.85rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.2s ease-out;
  z-index: 100;
`;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = "success") => {
    setToast({ message, variant, id: Date.now() });
  }, []);

  // Keyed to toast?.id so a new toast arriving before the old one's timer
  // fires resets the clock, instead of the old timer clearing the new toast.
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <ToastBar key={toast.id} $variant={toast.variant}>
          {toast.message}
        </ToastBar>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
