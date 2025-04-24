import React from "react";
import styles from "../pages/index.module.css";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { DashboardIcon, QueryIcon } from "./Icon";
import { useRouter } from "next/router";

const Sidebar = ({ selected, onSelect }: { selected: 'dashboard' | 'query'; onSelect: (s: 'dashboard' | 'query') => void }) => {
  const { dark, setDark } = useTheme();
  return (
    <aside
      style={{
        width: 240,
        background: dark
          ? "rgba(35, 33, 54, 0.85)"
          : "rgba(248, 250, 252, 0.85)",
        color: dark ? "#fff" : "#222",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        boxShadow: dark
          ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          : "0 8px 32px 0 rgba(60, 80, 180, 0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        backdropFilter: "blur(12px)",
        borderRight: dark
          ? "1.5px solid rgba(255,255,255,0.06)"
          : "1.5px solid rgba(0,0,0,0.04)",
        transition: "background 0.3s, box-shadow 0.3s"
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 26,
          padding: "38px 28px 22px 28px",
          letterSpacing: 1.2,
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          color: dark ? "#a5b4fc" : "#6366f1",
          textShadow: dark
            ? "0 1px 8px #18182577"
            : "0 1px 8px #6366f155"
        }}
      >
        QueryGPT
      </div>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
        <button
          onClick={() => onSelect("dashboard")}
          style={{
            width: "92%",
            margin: "0 auto 2px auto",
            padding: "14px 24px",
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            background: selected === "dashboard"
              ? (dark ? "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)" : "linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)")
              : "none",
            border: "none",
            color: selected === "dashboard" ? "#fff" : dark ? "#c7d0ff" : "#373a50",
            textAlign: "left",
            fontWeight: selected === "dashboard" ? 700 : 500,
            cursor: "pointer",
            borderRadius: 10,
            transition: "background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s",
            boxShadow: selected === "dashboard" ? "0 2px 8px 0 #6366f144" : "none",
            outline: 'none',
            transform: selected === "dashboard" ? 'scale(1.04)' : 'scale(1)',
            filter: selected === "dashboard" ? 'brightness(1.09)' : 'none',
            opacity: selected === "dashboard" ? 1 : 0.95
          }}
          onMouseOver={e => (e.currentTarget.style.background = selected === "dashboard" ? e.currentTarget.style.background : (dark ? '#23213655' : '#e0e7ff'))}
          onMouseOut={e => (e.currentTarget.style.background = selected === "dashboard" ? (dark ? "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)" : "linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)") : 'none')}
        >
          <DashboardIcon color={selected === "dashboard" ? "#fff" : dark ? "#a5b4fc" : "#6366f1"} size={22} />
          Dashboard
        </button>
        <button
          onClick={() => onSelect("query")}
          style={{
            width: "92%",
            margin: "0 auto 2px auto",
            padding: "14px 24px",
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            background: selected === "query"
              ? (dark ? "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)" : "linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)")
              : "none",
            border: "none",
            color: selected === "query" ? "#fff" : dark ? "#c7d0ff" : "#373a50",
            textAlign: "left",
            fontWeight: selected === "query" ? 700 : 500,
            cursor: "pointer",
            borderRadius: 10,
            transition: "background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s",
            boxShadow: selected === "query" ? "0 2px 8px 0 #6366f144" : "none",
            outline: 'none',
            transform: selected === "query" ? 'scale(1.04)' : 'scale(1)',
            filter: selected === "query" ? 'brightness(1.09)' : 'none',
            opacity: selected === "query" ? 1 : 0.95
          }}
          onMouseOver={e => (e.currentTarget.style.background = selected === "query" ? e.currentTarget.style.background : (dark ? '#23213655' : '#e0e7ff'))}
          onMouseOut={e => (e.currentTarget.style.background = selected === "query" ? (dark ? "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)" : "linear-gradient(90deg,#6366f1 0%,#a5b4fc 100%)") : 'none')}
        >
          <QueryIcon color={selected === "query" ? "#fff" : dark ? "#a5b4fc" : "#6366f1"} size={22} />
          Query Builder
        </button>
      </nav>
      <div style={{ padding: 28, marginTop: "auto", textAlign: "center" }}>
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>
    </aside>
  );
};

const DashboardLayout: React.FC<{
  selected: 'dashboard' | 'query';
  onSelect: (s: 'dashboard' | 'query') => void;
  children: React.ReactNode;
}> = ({ selected, onSelect, children }) => {
  const { dark } = useTheme();
  return (
    <div style={{ display: "flex" }}>
      <Sidebar selected={selected} onSelect={onSelect} />
      <main
        style={{
          marginLeft: 240,
          minHeight: "100vh",
          background: dark ? "linear-gradient(135deg, #181825 0%, #232136 100%)" : "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
          flex: 1,
          padding: "32px 0 0 0",
          transition: "background 0.3s",
          fontFamily: 'Inter, ui-sans-serif, system-ui',
        }}
      >
        <div style={{
          maxWidth: 1000,
          margin: "0 auto",
          borderRadius: 24,
          background: dark ? "rgba(36, 37, 46, 0.92)" : "rgba(255,255,255,0.93)",
          boxShadow: dark
            ? "0 8px 32px 0 rgba(31, 38, 135, 0.18)"
            : "0 8px 32px 0 rgba(60, 80, 180, 0.10)",
          padding: "40px 48px 48px 48px",
          minHeight: "80vh",
          marginTop: 28,
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          animation: 'fade-slide-in 0.5s cubic-bezier(.4,0,.2,1)',
        }}>
          {/* User avatar at top right */}
          <div style={{
            position: 'absolute',
            top: 32,
            right: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 10
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: dark ? 'linear-gradient(135deg,#6366f1 0%,#818cf8 100%)' : 'linear-gradient(135deg,#818cf8 0%,#6366f1 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px #6366f155',
              border: dark ? '2.5px solid #232136' : '2.5px solid #fff',
              letterSpacing: 1,
              userSelect: 'none',
              textShadow: '0 1px 6px #23213644',
            }}>
              {/* Try to get initials from username/email if available */}
              {typeof window !== 'undefined' && window.sessionStorage.getItem('user')
                ? JSON.parse(window.sessionStorage.getItem('user') || '{}').username?.slice(0,2).toUpperCase() || 'U'
                : 'U'}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
