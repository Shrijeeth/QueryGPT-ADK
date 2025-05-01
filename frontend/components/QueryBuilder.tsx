import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Highlight, { defaultProps } from 'prism-react-renderer';
import duotoneDark from 'prism-react-renderer/themes/duotoneDark';
import duotoneLight from 'prism-react-renderer/themes/duotoneLight';

const tabNames = ["Result", "SQL", "Explanation", "Error"] as const;
type Tab = typeof tabNames[number];

const QueryBuilder: React.FC<{ accessToken: string }> = ({ accessToken }) => {
  const { dark } = useTheme();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Result");
  const [copiedTab, setCopiedTab] = useState<Tab | null>(null);

  const handleCopy = (content: string, tab: Tab) => {
    navigator.clipboard.writeText(content);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 1500);
  };

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
    padding: '28px 36px',
    background: dark ? 'rgba(36,37,46,0.98)' : 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    boxShadow: dark
      ? '0 8px 32px 0 rgba(99,102,241,0.18)'
      : '0 8px 32px 0 rgba(60,72,135,0.10)',
    border: dark ? '1.5px solid #6366f1' : '1.5px solid #818cf8',
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
    color: dark ? '#c7d2fe' : '#3730a3',
    margin: '28px 0 0 0',
    paddingLeft: 36,
    letterSpacing: 0.12,
    fontFamily: 'Inter, ui-sans-serif, system-ui',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    padding: '28px 36px 0 36px',
    marginBottom: 0,
    background: dark ? 'rgba(36,37,46,0.98)' : 'rgba(255,255,255,0.97)',
  };

  const textareaStyle = {
    fontSize: 18,
    padding: 14,
    borderRadius: 10,
    border: dark ? '1.5px solid #393a4d' : '1.5px solid #818cf8',
    background: dark ? '#181825' : '#f4f6fb',
    color: dark ? '#c7d2fe' : '#232136',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    boxShadow: dark ? '0 1px 4px #6366f144' : '0 1px 4px #818cf811',
    outline: 'none',
    minWidth: 0,
    width: '100%',
    resize: 'none' as const,
    height: 48,
    marginBottom: 0,
  };

  const runButtonStyle = {
    padding: '10px 26px',
    fontSize: 18,
    borderRadius: 8,
    background: dark ? '#6366f1' : '#6366f1',
    color: dark ? '#fff' : '#fff',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 700,
    letterSpacing: 0.12,
    boxShadow: dark ? '0 1px 4px #6366f144' : '0 1px 4px #818cf811',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    height: 48,
    minWidth: 120,
  };

  const resultBlockStyle = {
    padding: '0 36px 28px 36px',
    background: dark ? '#232136' : '#f4f6fb',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    minHeight: 160,
    animation: 'fadein 0.5s',
    borderTop: dark ? '1.5px solid #393a4d' : '1.5px solid #818cf8',
  };

  const tabBarStyle = {
    display: 'flex',
    gap: 0,
    margin: '18px 0 16px 0',
    borderBottom: dark ? '1.5px solid #393a4d' : '1.5px solid #818cf8',
  };

  const tabButtonStyle = (active: boolean, tab: string) => ({
    padding: '9px 22px',
    border: 'none',
    borderBottom: active ? '3px solid #818cf8' : '3px solid transparent',
    background: 'none',
    color: active ? (dark ? '#c7d2fe' : '#3730a3') : (dark ? '#a5b4fc' : '#6366f1'),
    fontWeight: active ? 700 : 500,
    fontSize: 16,
    cursor: 'pointer',
    outline: 'none',
    transition: 'color 0.15s, border-bottom 0.18s',
    borderTopLeftRadius: tab === 'Result' ? 8 : 0,
    borderTopRightRadius: tab === 'Error' ? 8 : 0,
    marginRight: tab === 'Error' ? 0 : 4,
    fontFamily: 'Inter, ui-sans-serif, system-ui',
  });

  const tabContentStyle = {
    minHeight: 80,
    fontSize: 16,
    padding: '12px 2px 0 2px',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    color: dark ? '#e0e7ff' : '#232136',
  };

  const sqlBlockStyle = (base: any) => ({
    ...base,
    background: dark
      ? 'linear-gradient(90deg, #232136 80%, #181825 100%)'
      : 'linear-gradient(90deg, #f4f6fb 80%, #fff 100%)',
    color: dark ? '#c7d2fe' : '#3730a3',
    border: dark ? '1.5px solid #393a4d' : '1.5px solid #818cf8',
  });

  return (
    <div style={cardStyle}>
      <div style={headingStyle}>Query Builder</div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '28px 36px 28px 36px',
          marginBottom: 0,
          background: dark ? 'rgba(36,37,46,0.98)' : 'rgba(255,255,255,0.97)',
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
            border: dark ? '1.5px solid #393a4d' : '1.5px solid #818cf8',
            background: dark ? '#181825' : '#f4f6fb',
            color: dark ? '#c7d2fe' : '#232136',
            fontFamily: 'Inter, ui-sans-serif, system-ui',
            boxShadow: dark ? '0 1px 4px #6366f144' : '0 1px 4px #818cf811',
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
        <div style={{ padding: '0 36px 28px 36px', background: dark ? '#232136' : '#f4f6fb', borderBottomLeftRadius: 18, borderBottomRightRadius: 18, minHeight: 160, animation: 'fadein 0.5s', borderTop: dark ? '1.5px solid #393a4d' : '1.5px solid #818cf8' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, margin: '18px 0 16px 0', borderBottom: dark ? '1.5px solid #393a4d' : '1.5px solid #818cf8' }}>
            {tabNames.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 22px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #818cf8' : '3px solid transparent',
                  background: 'none',
                  color: activeTab === tab ? (dark ? '#c7d2fe' : '#3730a3') : (dark ? '#a5b4fc' : '#6366f1'),
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
          {/* Copied toast */}
          {copiedTab === activeTab && (
            <div style={{
              position: 'fixed',
              top: 48,
              right: 48,
              background: dark ? '#232136' : '#fff',
              color: dark ? '#c7d2fe' : '#232136',
              border: dark ? '1.5px solid #6366f1' : '1.5px solid #818cf8',
              borderRadius: 8,
              boxShadow: '0 2px 16px #23213633',
              padding: '10px 22px',
              fontWeight: 600,
              fontSize: 17,
              zIndex: 1000,
              transition: 'opacity 0.2s',
              opacity: copiedTab === activeTab ? 1 : 0,
            }}>
              Copied!
            </div>
          )}
          <div style={tabContentStyle}>
            {activeTab === 'Result' && (
              response ? (
                <div style={{ position: 'relative' }}>
                  <button
                    aria-label="Copy JSON result"
                    onClick={() => handleCopy(JSON.stringify(response, null, 2), 'Result')}
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 18,
                      background: dark ? '#232136' : '#fff',
                      color: dark ? '#c7d2fe' : '#232136',
                      border: dark ? '1.5px solid #6366f1' : '1.5px solid #818cf8',
                      borderRadius: 6,
                      padding: '5px 15px',
                      fontWeight: 500,
                      fontSize: 15,
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: dark ? '0 1px 4px #6366f144' : '0 1px 4px #818cf811',
                      transition: 'background 0.2s',
                    }}
                  >
                    Copy
                  </button>
                  <Highlight {...defaultProps} theme={dark ? duotoneDark : duotoneLight} code={JSON.stringify(response, null, 2)} language="json">
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre
                        className={className}
                        style={sqlBlockStyle({
                          ...style,
                          borderRadius: 12,
                          padding: '18px 20px 18px 18px',
                          fontFamily: 'JetBrains Mono, Fira Mono, monospace',
                          fontSize: 15.5,
                          boxShadow: dark ? '0 2px 12px #6366f122' : '0 2px 12px #818cf122',
                          overflowX: 'auto',
                        })}
                      >
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line, key: i })}>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token, key })} />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </div>
              ) : (
                <span style={{ color: dark ? '#a5b4fc' : '#6366f1' }}>No result yet.</span>
              )
            )}
            {activeTab === 'SQL' && (
              sql ? (
                <div style={{ position: 'relative' }}>
                  <button
                    aria-label="Copy SQL query"
                    onClick={() => handleCopy(sql, 'SQL')}
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 18,
                      background: dark ? '#232136' : '#fff',
                      color: dark ? '#c7d2fe' : '#232136',
                      border: dark ? '1.5px solid #6366f1' : '1.5px solid #818cf8',
                      borderRadius: 6,
                      padding: '5px 15px',
                      fontWeight: 500,
                      fontSize: 15,
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: dark ? '0 1px 4px #6366f144' : '0 1px 4px #818cf811',
                      transition: 'background 0.2s',
                    }}
                  >
                    Copy
                  </button>
                  <Highlight {...defaultProps} theme={dark ? duotoneDark : duotoneLight} code={sql} language="sql">
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre
                        className={className}
                        style={sqlBlockStyle({
                          ...style,
                          borderRadius: 12,
                          padding: '18px 20px 18px 18px',
                          fontFamily: 'JetBrains Mono, Fira Mono, monospace',
                          fontSize: 15.5,
                          boxShadow: dark ? '0 2px 12px #6366f122' : '0 2px 12px #818cf122',
                          overflowX: 'auto',
                        })}
                      >
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line, key: i })}>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token, key })} />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </div>
              ) : (
                <span style={{ color: dark ? '#a5b4fc' : '#6366f1' }}>No SQL generated yet.</span>
              )
            )}
            {activeTab === 'Explanation' && (
              explanation ? (
                <div style={{ position: 'relative' }}>
                  <button
                    aria-label="Copy explanation"
                    onClick={() => handleCopy(explanation, 'Explanation')}
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 18,
                      background: dark ? '#232136' : '#fff',
                      color: dark ? '#c7d2fe' : '#232136',
                      border: dark ? '1.5px solid #6366f1' : '1.5px solid #818cf8',
                      borderRadius: 6,
                      padding: '5px 15px',
                      fontWeight: 500,
                      fontSize: 15,
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: dark ? '0 1px 4px #6366f144' : '0 1px 4px #818cf811',
                      transition: 'background 0.2s',
                    }}
                  >
                    Copy
                  </button>
                  <pre style={sqlBlockStyle({
                    borderRadius: 12,
                    padding: '18px 20px 18px 18px',
                    fontFamily: 'JetBrains Mono, Fira Mono, monospace',
                    fontSize: 15.5,
                    boxShadow: dark ? '0 2px 12px #6366f122' : '0 2px 12px #818cf122',
                    overflowX: 'auto',
                  })}>{explanation}</pre>
                </div>
              ) : (
                <span style={{ color: dark ? '#a5b4fc' : '#6366f1' }}>No explanation available.</span>
              )
            )}
            {activeTab === 'Error' && (
              errorMsg ? (
                <div style={{ position: 'relative' }}>
                  <button
                    aria-label="Copy error message"
                    onClick={() => handleCopy(errorMsg, 'Error')}
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 18,
                      background: dark ? '#232136' : '#fff',
                      color: dark ? '#fca5a5' : '#232136',
                      border: '1.5px solid #7f1d1d',
                      borderRadius: 6,
                      padding: '5px 15px',
                      fontWeight: 500,
                      fontSize: 15,
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: '0 1px 4px #fca5a522',
                      transition: 'background 0.2s',
                    }}
                  >
                    Copy
                  </button>
                  <pre style={sqlBlockStyle({
                    borderRadius: 12,
                    padding: '18px 20px 18px 18px',
                    fontFamily: 'JetBrains Mono, Fira Mono, monospace',
                    fontSize: 15.5,
                    boxShadow: dark ? '0 2px 12px #6366f122' : '0 2px 12px #818cf122',
                    overflowX: 'auto',
                    background: dark ? '#181825' : '#f4f6fb',
                    color: dark ? '#fca5a5' : '#fca5a5',
                    border: dark ? '1.5px solid #7f1d1d' : '1.5px solid #7f1d1d',
                  })}>{errorMsg}</pre>
                </div>
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
