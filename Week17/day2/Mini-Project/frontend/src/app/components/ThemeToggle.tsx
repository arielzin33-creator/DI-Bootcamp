import { useAppDispatch, useAppSelector } from "../hooks";
import { toggleTheme } from "../../features/theme/themeSlice";

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.current);

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
