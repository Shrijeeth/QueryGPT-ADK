import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const tabNames = ["Result", "SQL", "Explanation", "Error"] as const;
type Tab = typeof tabNames[number];

const QueryBuilder: React.FC<{ accessToken: string }> = ({ accessToken }) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Result");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setActiveTab("Result");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        // Store previous query
        try {
          const prev = JSON.parse(sessionStorage.getItem('previous_queries') || '[]');
          const newEntry = { query, timestamp: Date.now() };
          const updated = [newEntry, ...prev.filter((q:any) => q.query !== query)].slice(0, 10);
          sessionStorage.setItem('previous_queries', JSON.stringify(updated));
        } catch {}
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Query failed");
        setActiveTab("Error");
      }
    } catch (err) {
      setError("Could not connect to server.");
      setActiveTab("Error");
    } finally {
      setLoading(false);
    }
  };

  // Extract SQL and explanation if present
  const sql = response?.result?.generated_query || response?.result?.sql || response?.generated_query || response?.sql || null;
  const explanation = response?.result?.explanation || response?.explanation || null;
  const errorMsg = error || response?.result?.error || response?.error || null;

  // Force dark mode for Query Builder
  const cardStyle = {
    maxWidth: 700,
    margin: "32px auto",
    padding: 0,
    background: 'rgba(36,37,46,0.98)',
    borderRadius: 18,
    boxShadow: '0 8px 32px 0 rgba(99,102,241,0.18)',
    border: '1.5px solid #6366f1',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    animation: 'fadein 0.7s',
    position: "relative" as const,
    overflow: 'hidden',
    backdropFilter: 'blur(7px)',
    WebkitBackdropFilter: 'blur(7px)',
  };

  const headingStyle = {
    fontWeight: 800,
    fontSize: 26,
    color: '#c7d2fe',
    margin: '28px 0 0 0',
    paddingLeft: 36,
    letterSpacing: 0.12,
    fontFamily: 'Inter, ui-sans-serif, system-ui',
  };

  return (
    <div style={cardStyle}>
      <div style={headingStyle}>Query Builder</div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '28px 36px 0 36px',
          marginBottom: 0,
          borderBottom: '1.5px solid #6366f1',
          background: 'rgba(36,37,46,0.98)',
        }}
      >
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={3}
          placeholder="Ask a data question or describe your analytics task..."
          style={{
            fontSize: 18,
            padding: 14,
            borderRadius: 10,
            border: '1.5px solid #393a4d',
            background: '#181825',
            color: '#c7d2fe',
            fontFamily: 'Inter, ui-sans-serif, system-ui',
            boxShadow: '0 1px 4px #6366f144',
            outline: 'none',
            minWidth: 0,
            width: '100%',
            resize: 'none',
            height: 48,
            marginBottom: 0,
          }}
          disabled={loading}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              padding: '10px 26px',
              fontSize: 18,
              borderRadius: 8,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              letterSpacing: 0.12,
              boxShadow: '0 1px 4px #6366f144',
              fontFamily: 'Inter, ui-sans-serif, system-ui',
              height: 48,
              minWidth: 120,
            }}
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Query'}
          </button>
        </div>
      </form>
      {(response || error) && (
        <div style={{ padding: '0 36px 28px 36px', background: '#232136', borderBottomLeftRadius: 18, borderBottomRightRadius: 18, minHeight: 160, animation: 'fadein 0.5s', borderTop: '1.5px solid #393a4d' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, margin: '18px 0 16px 0', borderBottom: '1.5px solid #393a4d' }}>
            {tabNames.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 22px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #818cf8' : '3px solid transparent',
                  background: 'none',
                  color: activeTab === tab ? '#c7d2fe' : '#a5b4fc',
                  fontWeight: activeTab === tab ? 700 : 500,
                  fontSize: 16,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'color 0.15s, border-bottom 0.18s',
                  borderTopLeftRadius: tab === 'Result' ? 8 : 0,
                  borderTopRightRadius: tab === 'Error' ? 8 : 0,
                  marginRight: tab === 'Error' ? 0 : 4,
                  fontFamily: 'Inter, ui-sans-serif, system-ui',
                }}
                disabled={tab === 'Error' && !errorMsg}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div style={{ minHeight: 80, fontSize: 16, padding: '12px 2px 0 2px', fontFamily: 'Inter, ui-sans-serif, system-ui', color: '#e0e7ff' }}>
            {activeTab === 'Result' && (
              response ? (
                <pre style={{ whiteSpace: 'pre-wrap', background: '#232136', borderRadius: 10, padding: 16, color: '#c7d2fe', fontSize: 15, boxShadow: '0 1px 4px #6366f111', border: '1.5px solid #393a4d' }}>{JSON.stringify(response, null, 2)}</pre>
              ) : (
                <span style={{ color: '#a5b4fc' }}>No result yet.</span>
              )
            )}
            {activeTab === 'SQL' && (
              sql ? (
                <pre style={{ background: '#181825', color: '#a5b4fc', borderRadius: 10, padding: 16, fontSize: 16, boxShadow: '0 1px 4px #6366f144', border: '1.5px solid #393a4d' }}>{sql}</pre>
              ) : (
                <span style={{ color: '#a5b4fc' }}>No SQL available.</span>
              )
            )}
            {activeTab === 'Explanation' && (
              explanation ? (
                <pre style={{ background: '#232136', color: '#c7d2fe', borderRadius: 10, padding: 16, fontSize: 16, boxShadow: '0 1px 4px #6366f111', border: '1.5px solid #393a4d' }}>{explanation}</pre>
              ) : (
                <span style={{ color: '#a5b4fc' }}>No explanation available.</span>
              )
            )}
            {activeTab === 'Error' && (
              errorMsg ? (
                <pre style={{ background: '#181825', color: '#fca5a5', borderRadius: 10, padding: 16, fontSize: 16, boxShadow: '0 1px 4px #fca5a522', border: '1.5px solid #7f1d1d' }}>{errorMsg}</pre>
              ) : (
                <span style={{ color: '#a5b4fc' }}>No error.</span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QueryBuilder;
