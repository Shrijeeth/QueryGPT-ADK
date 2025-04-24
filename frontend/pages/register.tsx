import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ThemeToggle from "../components/ThemeToggle";
import styles from "./index.module.css";

const Register: React.FC = () => {
  const [dark, setDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Detect theme from body or localStorage (if you have a theme system)
    if (typeof window !== "undefined") {
      setDark(document.body.classList.contains("dark"));
    }
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          email: form.email,
          full_name: form.name
        })
      });
      if (res.ok) {
        setMessage("Registration successful! You can now log in.");
        setForm({ name: "", email: "", username: "", password: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Registration failed. Try again.");
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
        className={styles["register-form"]}
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
        onSubmit={handleSubmit}
      >
        <h2 style={{ textAlign: "center", marginBottom: "0.7rem", fontWeight: 700 }}>
          Create your account
        </h2>
        <input
          name="name"
          type="text"
          placeholder="Name"
          required
          value={form.name}
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
          name="email"
          type="email"
          placeholder="Email"
          required
          value={form.email}
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
          minLength={6}
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
          className={styles.cta}
          style={{ width: "100%", marginTop: 8 }}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {message && (
          <div style={{ color: dark ? "#a5f3fc" : "#059669", textAlign: "center", fontSize: 15 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ color: dark ? "#fda4af" : "#b91c1c", textAlign: "center", fontSize: 15 }}>
            {error}
          </div>
        )}
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
}

export default Register;
