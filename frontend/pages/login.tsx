import React, { useState } from "react";
import { useRouter } from "next/router";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./index.module.css";
import { useTheme } from "../context/ThemeContext";

const Login: React.FC = () => {
  const { dark, setDark } = useTheme();
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();


  // Store token in memory for this session only (best for SSR apps)
  // If you need to access the token across pages, consider using React context or sessionStorage
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: form.username,
          password: form.password,
          scope: "",
          client_id: "",
          client_secret: ""
        }).toString(),
      });
      if (res.ok) {
        const data = await res.json();
        // Store token in sessionStorage (temporary, cleared on tab close)
        if (data.access_token) {
          sessionStorage.setItem("access_token", data.access_token);
          setAccessToken(data.access_token);
          setMessage("Login successful!");
          setTimeout(() => router.push("/"), 1000); // Redirect after login
        } else {
          setError("No access token received.");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.detail) {
          setError(data.detail);
        } else if (Array.isArray(data) && data[0]?.msg) {
          setError(data.map((e:any) => e.msg).join(" "));
        } else {
          setError("Login failed. Check credentials.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          dark
            ? "radial-gradient(ellipse 80% 60% at 50% 0%, #232136 0%, #181825 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        transition: "background 0.3s",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}>
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          background: dark ? "#232136cc" : "#fff",
          color: dark ? "#f5f6fa" : "#232136",
          border: dark ? "1.5px solid #6366f1" : "1.5px solid #c7d2fe",
          borderRadius: "1.2rem",
          boxShadow: dark
            ? "0 4px 32px rgba(60,72,100,0.14)"
            : "0 4px 32px rgba(99,102,241,0.08)",
          padding: "2.5rem 2rem 2rem 2rem",
          minWidth: 320,
          maxWidth: 380,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "0.7rem", fontWeight: 700 }}>
          {dark ? "🌙 " : "☀️ "}Login
        </h2>
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          value={form.username}
          onChange={handleChange}
          style={{
            padding: "0.8rem 1rem",
            borderRadius: 8,
            border: dark ? "1px solid #6366f1" : "1px solid #c7d2fe",
            background: dark ? "#232136" : "#f4f6fb",
            color: dark ? "#fff" : "#232136",
            fontSize: 16,
            outline: "none",
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={handleChange}
          style={{
            padding: "0.8rem 1rem",
            borderRadius: 8,
            border: dark ? "1px solid #6366f1" : "1px solid #c7d2fe",
            background: dark ? "#232136" : "#f4f6fb",
            color: dark ? "#fff" : "#232136",
            fontSize: 16,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.9rem 0",
            borderRadius: 8,
            border: "none",
            background:
              "linear-gradient(90deg, #6366f1 0%, #3730a3 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 17,
            cursor: "pointer",
            marginTop: "0.3rem",
            marginBottom: "0.8rem",
            boxShadow: dark
              ? "0 2px 12px 0 rgba(99,102,241,0.18)"
              : "0 2px 12px 0 rgba(99,102,241,0.08)",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {message && (
          <div
            style={{
              color: dark ? "#059669" : "#059669",
              background: dark ? "#052e16" : "#ecfdf5",
              borderRadius: 8,
              padding: "0.6rem 1rem",
              fontWeight: 600,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}
        {error != null && error !== "" && (() => {
          const errVal = error as unknown;
          const style = {
            color: dark ? "#fde68a" : "#dc2626",
            background: dark ? "#7f1d1d" : "#fef2f2",
            borderRadius: 8,
            padding: "0.6rem 1rem",
            fontWeight: 600,
            fontSize: 16,
            textAlign: "center" as const,
          };
          if (Array.isArray(errVal)) {
            return (
              <div style={style}>
                {errVal.map((e, i) =>
                  typeof e === "object" && e && "msg" in e
                    ? <div key={i}>{e.msg}</div>
                    : <div key={i}>{String(e)}</div>
                )}
              </div>
            );
          } else if (typeof errVal === "object" && errVal && "msg" in errVal) {
            return <div style={style}>{(errVal as any).msg}</div>;
          } else {
            return <div style={style}>{String(errVal)}</div>;
          }
        })()}

        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            color: dark ? "#a5b4fc" : "#6366f1",
            cursor: "pointer",
            marginTop: 6,
            textAlign: "center",
            fontSize: 15,
          }}
          onClick={() => router.push("/")}
        >
          ← Back to Home
        </button>
      </form>
    </div>
  );
};

export default Login;
