import React from "react";

interface ThemeToggleProps {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ dark, setDark }) => (
  <button
    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    onClick={() => setDark((d) => !d)}
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
