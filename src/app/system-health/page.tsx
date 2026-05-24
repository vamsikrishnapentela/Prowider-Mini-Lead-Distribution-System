'use client';

import { useState, useEffect } from 'react';

export default function SystemHealth() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/system-health');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return <main><p>Loading system health...</p></main>;

  return (
    <main>
      <h1>System Observability</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Live monitoring of backend allocations, edge-case blocks, and provider health.
      </p>

      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Total Lead Allocations</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{data?.totalLeads}</div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Failed (Unassigned)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: data?.unassignedLeads > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {data?.unassignedLeads}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Duplicate Requests Blocked</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{data?.duplicatesBlocked}</div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Provider Pool Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 500 }}>Active Providers (Quota Available)</span>
            <span className="badge success">{data?.activeProviders}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
            <span style={{ fontWeight: 500 }}>Exhausted Providers (Quota Full)</span>
            <span className="badge danger">{data?.exhaustedProviders}</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>System Events</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem' }}>
            <span style={{ fontWeight: 500 }}>Webhook Quota Resets Processed</span>
            <span className="badge" style={{ background: 'var(--surface-hover)', color: 'var(--text-main)' }}>{data?.webhooksProcessed}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
