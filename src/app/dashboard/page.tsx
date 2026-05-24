'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [providers, setProviders] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (leadId: string) => {
    setRetryingId(leadId);
    try {
      const res = await fetch('/api/leads/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });
      const data = await res.json();
      if (!res.ok) alert(data.error);
      else fetchData(); // refresh data
    } catch (err: any) {
      alert(err.message);
    }
    setRetryingId(null);
  };

  const fetchData = async () => {
    try {
      const [provRes, leadsRes] = await Promise.all([
        fetch('/api/providers'),
        fetch(`/api/leads${selectedProvider !== 'all' ? `?providerId=${selectedProvider}` : ''}`)
      ]);
      const provData = await provRes.json();
      const leadsData = await leadsRes.json();
      
      if (provData.providers) setProviders(provData.providers);
      if (leadsData.leads) setLeads(leadsData.leads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds for real-time update
    return () => clearInterval(interval);
  }, [selectedProvider]);

  return (
    <main>
      <h1>Provider Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: 500 }}>Select Provider View:</label>
        <select 
          value={selectedProvider} 
          onChange={(e) => setSelectedProvider(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="all">All Providers</option>
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        {providers.filter(p => selectedProvider === 'all' || p.id.toString() === selectedProvider).map(provider => (
          <div key={provider.id} className="card">
            <h3>{provider.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>Quota Used</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>
              <span style={{ color: provider.quotaUsed >= provider.monthlyQuota ? 'var(--danger)' : provider.quotaUsed >= 8 ? '#f59e0b' : 'var(--primary)' }}>
                {provider.quotaUsed}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}> / {provider.monthlyQuota}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (provider.quotaUsed / provider.monthlyQuota) * 100)}%`, 
                height: '100%', 
                background: provider.quotaUsed >= provider.monthlyQuota ? 'var(--danger)' : provider.quotaUsed >= 8 ? '#f59e0b' : 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Assigned Leads ({leads.length})</h3>
        {loading && leads.length === 0 ? (
          <p>Loading leads...</p>
        ) : leads.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No leads available.</p>
            <p style={{ color: 'var(--text-main)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Run a simulation in Test Tools or submit a form to populate data.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Reason</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.city}</td>
                    <td><span className="badge">{lead.serviceId}</span></td>
                    <td>
                      <span className={`badge ${lead.status === 'UNASSIGNED' ? 'danger' : 'success'}`}>
                        {lead.status || 'ASSIGNED'}
                      </span>
                    </td>
                    <td>
                      {lead.status === 'UNASSIGNED' ? (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      ) : (
                        lead.assignedProviders.map((p: any, i: number) => (
                          <span key={i} className="badge" style={{ marginRight: '4px' }}>
                            P{typeof p === 'object' ? p.id : p}
                          </span>
                        ))
                      )}
                    </td>
                    <td>
                      {lead.status === 'UNASSIGNED' ? (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {lead.assignedProviders.map((p: any, i: number) => {
                            const pId = typeof p === 'object' ? p.id : p;
                            const reason = typeof p === 'object' ? (p.reason === 'MANDATORY' ? 'Mandatory Rule' : 'Round Robin') : 'N/A';
                            return (
                              <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                P{pId}: {reason}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                    <td>
                      {lead.status === 'UNASSIGNED' && (
                        <button 
                          onClick={() => handleRetry(lead._id)} 
                          disabled={retryingId === lead._id}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          {retryingId === lead._id ? 'Retrying...' : 'Retry Assignment'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
