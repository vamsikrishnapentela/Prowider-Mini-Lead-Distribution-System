export default function Home() {
  return (
    <main>
      <h1>Prowider Mini Lead System</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '2rem' }}>
        A system for distributing leads efficiently and fairly among providers.
      </p>

      <div className="grid grid-cols-3">
        <div className="card">
          <h3>Customer Form</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Submit a service request. Includes advanced duplicate detection.
          </p>
          <a href="/request-service" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Go to Form &rarr;
          </a>
        </div>

        <div className="card">
          <h3>Provider Dashboard</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Real-time dashboard for providers to view assigned leads and quota.
          </p>
          <a href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Go to Dashboard &rarr;
          </a>
        </div>

        <div className="card">
          <h3>Test Tools</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Simulation panel for webhooks, concurrency, and seeding data.
          </p>
          <a href="/test-tools" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Go to Test Tools &rarr;
          </a>
        </div>
      </div>
    </main>
  );
}
