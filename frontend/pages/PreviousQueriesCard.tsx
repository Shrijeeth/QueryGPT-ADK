import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

interface QueryItem {
  query: string;
  timestamp: number;
}

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString();
};

const cardBaseStyle = {
  fontFamily: 'Inter, ui-sans-serif, system-ui',
  borderRadius: 18,
  boxShadow: '0 8px 32px 0 rgba(60,72,135,0.12)',
  border: '1.5px solid #e0e7ff',
  backdropFilter: 'blur(7px)',
  WebkitBackdropFilter: 'blur(7px)',
  padding: '22px 26px',
  transition: 'box-shadow 0.18s, background 0.18s',
  marginBottom: 0,
};

const PreviousQueriesCard: React.FC = () => {
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const { dark } = useTheme();

  useEffect(() => {
    const stored = sessionStorage.getItem("previous_queries");
    if (stored) {
      setQueries(JSON.parse(stored));
    }
  }, []);

  const getCardStyle = (hover = false) => ({
    ...cardBaseStyle,
    background: dark
      ? hover
        ? 'rgba(36,37,46,0.94)' : 'rgba(36,37,46,0.86)'
      : hover
        ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.93)',
    color: dark ? '#f5f6fa' : '#232136',
    cursor: 'pointer',
    boxShadow: hover
      ? '0 6px 32px 0 rgba(99,102,241,0.18)'
      : '0 8px 32px 0 rgba(60,72,135,0.12)',
    border: dark ? '1.5px solid #6366f1' : '1.5px solid #e0e7ff',
  });

  if (!queries.length) {
    return (
      <div style={{
        ...cardBaseStyle,
        background: dark ? 'rgba(36,37,46,0.86)' : 'rgba(255,255,255,0.93)',
        color: dark ? '#a5b4fc' : '#64748b',
        textAlign: 'center',
        fontSize: 16,
      }}>
        No previous queries yet. Run a query to see it here!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {queries.slice(0, 10).map((item, i) => {
        const [hover, setHover] = useState(false);
        return (
          <div
            key={i}
            style={getCardStyle(hover)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 3, color: dark ? '#c7d2fe' : '#232136' }}>
              {item.query}
            </div>
            <div style={{ color: '#818cf8', fontSize: 13 }}>{formatDate(item.timestamp)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default PreviousQueriesCard;
