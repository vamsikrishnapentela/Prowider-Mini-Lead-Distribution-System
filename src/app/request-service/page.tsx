'use client';

import { useState } from 'react';

export default function RequestService() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    serviceId: 'service1',
    description: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Validate empty/whitespace only
    if (!formData.name.trim() || !formData.description.trim()) {
      setStatus({ type: 'error', message: 'Name and description cannot be empty.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      if (data.lead && data.lead.status === 'UNASSIGNED') {
        const msg = 'Your request has been saved. A provider will be assigned to you shortly.';
        alert(msg);
        setStatus({ type: 'success', message: msg }); 
      } else {
        const pIds = data.assignedProviders.map((p: any) => p.id).join(', ');
        setStatus({ type: 'success', message: `Lead created! Assigned to Providers: ${pIds}` });
      }
      setFormData({ name: '', phone: '', city: '', serviceId: 'service1', description: '' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Request a Service</h1>
      
      <div className="card" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              required 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="9999999999"
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input 
              type="text" 
              required 
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              placeholder="New York"
            />
          </div>

          <div className="form-group">
            <label>Service Type</label>
            <select 
              value={formData.serviceId}
              onChange={e => setFormData({...formData, serviceId: e.target.value})}
            >
              <option value="service1">Service 1</option>
              <option value="service2">Service 2</option>
              <option value="service3">Service 3</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              required 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Please describe what you need..."
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {status && (
        <div className="toast" style={{ borderLeft: `4px solid var(--${status.type})` }}>
          <strong style={{ color: `var(--${status.type})` }}>
            {status.type === 'success' ? 'Success' : 'Error'}
          </strong>
          <p>{status.message}</p>
        </div>
      )}
    </main>
  );
}
