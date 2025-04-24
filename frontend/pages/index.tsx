import { useRef, useEffect, useState } from "react";
import styles from "./index.module.css";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const features = [
  {
    icon: "💬",
    title: "Natural Language to SQL",
    description: "Converts user questions into SQL queries using LLM-based agents.",
  },
  {
    icon: "🧠",
    title: "Multi-Agent Architecture",
    description: "Modular agents for query formation, explanation, table/column selection, and validation.",
  },
  {
    icon: "🔍",
    title: "Vector Search Integration",
    description: "Uses Qdrant for semantic search over sample queries and table schemas.",
  },
  {
    icon: "✅",
    title: "Validation",
    description: "Ensures only valid SELECT queries are generated and executed.",
  },
  {
    icon: "🔒",
    title: "Production-Ready Security",
    description: "Rate limiting, account lockout, JWT authentication, password hashing, and error handling.",
  },
  {
    icon: "🧩",
    title: "Extensible & Modular",
    description: "Easy to add new agents, tools, or infrastructure. Organized codebase for rapid development.",
  },
  {
    icon: "🔗",
    title: "LLM Provider Flexibility",
    description: "Supports Gemini, Ollama, OpenAI, or any LLM provider by configuring environment variables.",
  },
  {
    icon: "📊",
    title: "Sample Data Included",
    description: "Includes sample queries and table schemas for demonstration and testing.",
  },
];

interface ParallaxBackgroundProps {
  dark: boolean;
}
const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ dark }) => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '140vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {dark ? (
        <>
          {/* Blue Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-10vh',
              left: '-15vw',
              width: '60vw',
              height: '60vw',
              background: 'radial-gradient(circle at 50% 50%, #6366f1 0%, #232136 80%)',
              opacity: 0.65,
              filter: 'blur(60px)',
              transform: `translateY(${offset * 0.18}px)`,
              transition: 'transform 0.1s',
            }}
          />
          {/* Purple Glow */}
          <div
            style={{
              position: 'absolute',
              top: '30vh',
              right: '-18vw',
              width: '55vw',
              height: '55vw',
              background: 'radial-gradient(circle at 50% 50%, #a5b4fc 0%, #6366f1 90%)',
              opacity: 0.35,
              filter: 'blur(70px)',
              transform: `translateY(${offset * 0.12}px)`,
              transition: 'transform 0.1s',
            }}
          />
          {/* Pink Glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-12vh',
              left: '20vw',
              width: '50vw',
              height: '50vw',
              background: 'radial-gradient(circle at 50% 50%, #ff7cf0 0%, #232136 90%)',
              opacity: 0.19,
              filter: 'blur(80px)',
              transform: `translateY(${offset * 0.08}px)`,
              transition: 'transform 0.1s',
            }}
          />
        </>
      ) : (
        // Light mode: subtle white/gray glow only
        <div
          style={{
            position: 'absolute',
            top: '-8vh',
            left: '-10vw',
            width: '80vw',
            height: '70vw',
            background: 'radial-gradient(circle at 50% 50%, #e0e7ff 0%, #f8fafc 90%)',
            opacity: 0.22,
            filter: 'blur(64px)',
            transform: `translateY(${offset * 0.10}px)`,
            transition: 'transform 0.1s',
          }}
        />
      )}
    </div>
  );
};

import { useRouter } from "next/router";

const Home: React.FC = () => {
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const { dark, setDark } = useTheme();


  // Scroll to Features section
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll animation for features
  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll("." + styles["feature-card"]);
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
          (card as HTMLElement).classList.add(styles.visible);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <ParallaxBackground dark={dark} />
      <main className={styles.container}>
        <ThemeToggle dark={dark} setDark={setDark} />
        <section className={styles.hero}>
          <span className={styles["hero-watermark"]} aria-hidden="true">🤖</span>
          <h1 className={styles.heading}>QueryGPT-ADK</h1>
          <p className={styles.subtitle}>Open-source, multi-agent system for natural language to SQL query generation and explanation.</p>
          <div className={styles.intro}>
            <p>
              QueryGPT-ADK leverages LLMs and vector search to help users convert natural language questions into SQL queries, explain them, and validate them—making database analytics accessible to everyone.
            </p>
            <ul>
              <li>Enter a natural language question (e.g., "Show me the top 5 medicines by usage")</li>
              <li>Authenticate via registration/login</li>
              <li>See the generated SQL, explanation, and results</li>
              <li>Handles rate limiting, account lockout, and error responses</li>
            </ul>
          </div>
          <div className={styles['cta-buttons']}>
            <a href="/login" className={styles.navBtn + ' ' + styles.signinBtn}>Sign In</a>
            <a href="/register" className={styles.navBtn + ' ' + styles.signupBtn}>Sign Up</a>
          </div>
        </section>
        <div className={styles.divider} aria-hidden="true" />
        <section className={styles.features} ref={featuresRef}>
          <h2 className={styles.sectionHeading}>Features</h2>
          <div className={styles["features-grid"]}>
            {features.map((f, i) => (
              <div className={styles["feature-card"]} key={i}>
                <span className={styles.icon}>{f.icon}</span>
                <h3 className={styles["feature-title"]}>{f.title}</h3>
                <p className={styles["feature-desc"]}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
