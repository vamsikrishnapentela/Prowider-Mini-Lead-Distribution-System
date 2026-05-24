'use client';

import { useState } from 'react';

export default function TestTools() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleSeed = async () => {
    if (!confirm('Are you sure you want to reset ALL data? This will wipe the database.')) return;
    setLoading(true);
    addLog('Seeding database...');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) addLog(`Success: ${data.message}`);
      else addLog(`Error: ${data.error}`);
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const handleResetQuota = async () => {
    if (!confirm('Are you sure you want to reset all provider quotas?')) return;
    setLoading(true);
    const idempotencyKey = `reset-${Date.now()}`;
    addLog(`Calling webhook with key: ${idempotencyKey}`);
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey })
      });
      const data = await res.json();
      addLog(`Response: ${data.message || data.error}`);
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const handleWebhookMultiple = async () => {
    setLoading(true);
    const idempotencyKey = `reset-multi-${Date.now()}`;
    addLog(`Calling webhook 3 times simultaneously with key: ${idempotencyKey}`);
    try {
      const promises = [1, 2, 3].map(i => fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey })
      }).then(r => r.json()));
      
      const results = await Promise.all(promises);
      results.forEach((res, i) => {
        addLog(`Response ${i+1}: ${res.message || res.error}`);
      });
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const handleConcurrentLeads = async () => {
    setLoading(true);
    addLog('Generating 10 leads simultaneously...');
    
    const serviceIds = ['service1', 'service2', 'service3'];
    const promises = Array.from({ length: 10 }).map((_, i) => {
      const randomPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const serviceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
      
      return fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Concurrent User ${i+1}`,
          phone: randomPhone,
          city: 'Test City',
          serviceId,
          description: `Concurrency test lead ${i+1}`
        })
      }).then(async r => {
        const data = await r.json();
        return { ok: r.ok, data };
      }).catch(e => ({ ok: false, data: { error: e.message } }));
    });

    const results = await Promise.all(promises);
    let success = 0;
    let failed = 0;
    
    results.forEach(res => {
      if (res.ok) success++;
      else failed++;
    });
    
    addLog(`Concurrency test complete: ${success} created, ${failed} failed.`);
    setLoading(false);
  };

  return (
    <main>
      <h1>Test Tools & Simulation</h1>
      
      <div className="grid grid-cols-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={handleSeed} disabled={loading}>
              1. Reset All Data to Zero (Seed)
            </button>
            <button onClick={handleResetQuota} disabled={loading}>
              2. Reset All Quotas (Single Webhook)
            </button>
            <button onClick={handleWebhookMultiple} disabled={loading}>
              3. Test Idempotency (3 Simultaneous Webhooks)
            </button>
            <button onClick={handleConcurrentLeads} disabled={loading} style={{ background: 'var(--success)' }}>
              4. Generate 10 Leads Concurrently
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Execution Logs</h3>
          <div style={{ 
            background: 'var(--background)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border)',
            height: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {logs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <p>No execution logs available.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Run a simulation to inspect allocation behavior.</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--surface)', paddingBottom: '0.5rem' }}>
                  {log}
                </div>
              ))
            )}
          </div>
          <button onClick={() => setLogs([])} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border)', width: '100%' }}>
            Clear Logs
          </button>
        </div>
      </div>
    </main>
  );
}
