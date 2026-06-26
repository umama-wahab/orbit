import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

const THEMES = ["social", "focus", "shadow"];

export function ThemeProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("orbit_theme") || "social";
  });

  useEffect(() => {
    if (user?.theme && THEMES.includes(user.theme)) {
      setThemeState(user.theme);
      localStorage.setItem("orbit_theme", user.theme);
    }
  }, [user?.theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = async (next) => {
    if (!THEMES.includes(next)) return;
    setThemeState(next);
    localStorage.setItem("orbit_theme", next);
    if (user) {
      updateUser({ theme: next });
      try {
        await api.put("/users/theme", { theme: next });
      } catch {
        /* non-critical */
      }
    }
  };

  return <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
