import React from "react";

interface ThemeToggleProps {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
}

// Theme persistence helpers
export function getSavedTheme(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  // fallback to system
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
export function saveTheme(isDark: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ dark, setDark }) => (
  <button
    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    onClick={() => {
      setDark((d) => {
        saveTheme(!d);
        return !d;
      });
    }}
    style={{
      position: "fixed",
      top: 18,
      right: 24,
      zIndex: 100,
      background: "none",
      border: "none",
      fontSize: "2rem",
      cursor: "pointer",
      color: dark ? "#ffe066" : "#3730a3",
      transition: "color 0.2s"
    }}
    title={dark ? "Switch to light mode" : "Switch to dark mode"}
  >
    {dark ? "☀️" : "🌙"}
  </button>
);

export default ThemeToggle;
