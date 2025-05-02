import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.replace("/");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/validate-token`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setUser({ username: data.username, email: data.email });
        } else {
          router.replace("/");
        }
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const [selected, setSelected] = useState<'dashboard' | 'query'>('dashboard');

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <DashboardLayout selected={selected} onSelect={setSelected}>
      {selected === 'dashboard' ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 18,
          padding: '16px 0 0 0',
          animation: 'fadein 0.6s',
        }}>
          <h1 style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui',
            fontWeight: 800,
            fontSize: 36,
            letterSpacing: 0.2,
            marginBottom: 8,
            color: '#6366f1',
            textShadow: '0 2px 12px #6366f133'
          }}>
            Welcome to your Dashboard, <span>{user.username}</span>!
          </h1>
          {/* Previous Queries Section */}
          <div style={{ marginTop: 30, width: '100%' }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, color: '#6366f1', marginBottom: 12, letterSpacing: 0.1 }}>Previous Queries</h3>
            <PreviousQueriesCard />
          </div>
        </div>
      ) : (
        <React.Suspense fallback={<div>Loading Query Builder...</div>}>
          <QueryBuilder accessToken={sessionStorage.getItem('access_token') || ''} />
        </React.Suspense>
      )}
    </DashboardLayout>
  );
};

import DashboardLayout from '../components/DashboardLayout';
import QueryBuilder from '../components/QueryBuilder';
import PreviousQueriesCard from './PreviousQueriesCard';
import UserInfoCard from './UserInfoCard';

export default Dashboard;
