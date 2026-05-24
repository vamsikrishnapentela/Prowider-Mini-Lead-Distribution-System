import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Prowider Lead System",
  description: "Mini Lead Distribution System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav style={{ 
            position: 'sticky', 
            top: '1rem', 
            zIndex: 100, 
            background: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontWeight: 700, marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '6px' }}></div>
              Prowider
            </div>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Home</Link>
            <Link href="/request-service" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Request Service</Link>
            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Dashboard</Link>
            <Link href="/system-health" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>System Health</Link>
            <Link href="/test-tools" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Test Tools</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
