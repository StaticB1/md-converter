import Head from 'next/head';
import Link from 'next/link';

const MONO = "'JetBrains Mono', monospace";
const SANS = "'Syne', sans-serif";
const GREEN = '#6ee7b7';

export default function About() {
  return (
    <>
      <Head>
        <title>About — MD ↔ HTML Converter</title>
        <meta name="description" content="About MD ↔ HTML Converter — a free, fast, browser-based tool to convert Markdown to HTML and back." />
      </Head>
      <div style={s.root}>
        <header style={s.header}>
          <Link href="/" style={s.back}>← Back to Converter</Link>
          <h1 style={s.title}>About</h1>
          <p style={s.sub}>MD ↔ HTML Converter</p>
        </header>

        <main style={s.main}>
          <section style={s.section}>
            <h2 style={s.h2}>What is this?</h2>
            <p style={s.p}>MD ↔ HTML Converter is a free, fast, browser-based tool that converts Markdown to HTML and HTML back to Markdown. No signup, no installation, no data sent to any server — everything runs in your browser.</p>
          </section>

          <section style={s.section}>
            <h2 style={s.h2}>Features</h2>
            <ul style={s.ul}>
              <li style={s.li}>Live preview as you type</li>
              <li style={s.li}>Markdown → HTML conversion</li>
              <li style={s.li}>HTML → Markdown conversion</li>
              <li style={s.li}>One-click copy to clipboard</li>
              <li style={s.li}>Completely free, no account required</li>
              <li style={s.li}>Works entirely in your browser — no data leaves your device</li>
            </ul>
          </section>

          <section style={s.section}>
            <h2 style={s.h2}>Who is it for?</h2>
            <p style={s.p}>Developers, writers, and content creators who need a quick way to convert between Markdown and HTML without installing any tools or signing up for any service.</p>
          </section>

          <section style={s.section}>
            <h2 style={s.h2}>Technology</h2>
            <p style={s.p}>Built with <a href="https://nextjs.org" style={s.a} target="_blank" rel="noopener noreferrer">Next.js</a>. The converter engine is a lightweight, dependency-free JavaScript implementation that runs entirely client-side.</p>
          </section>

          <section style={s.section}>
            <h2 style={s.h2}>Privacy</h2>
            <p style={s.p}>We take privacy seriously. Read our <Link href="/privacy" style={s.a}>Privacy Policy</Link> for details on how we handle data.</p>
          </section>
        </main>

        <footer style={s.footer}>
          <span>MD ↔ HTML Converter · Free Online Tool</span>
          <span style={s.footerLinks}>
            <Link href="/" style={s.footerLink}>Home</Link>
            <Link href="/about" style={s.footerLink}>About</Link>
            <Link href="/privacy" style={s.footerLink}>Privacy</Link>
          </span>
        </footer>
      </div>
    </>
  );
}

const s = {
  root: { minHeight: '100vh', background: '#0d0e11', color: '#e2e8f0', fontFamily: SANS, display: 'flex', flexDirection: 'column' },
  header: { padding: '32px 40px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  back: { fontFamily: MONO, fontSize: 12, color: GREEN, textDecoration: 'none', letterSpacing: '0.04em' },
  title: { fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg,#6ee7b7,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '16px 0 4px' },
  sub: { fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.04em' },
  main: { flex: 1, padding: '40px', maxWidth: 760 },
  section: { marginBottom: 40 },
  h2: { fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, marginTop: 0 },
  p: { fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' },
  a: { color: GREEN, textDecoration: 'none' },
  ul: { paddingLeft: 20, margin: '8px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  footer: { padding: '14px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: MONO },
  footerLinks: { display: 'flex', gap: 20 },
  footerLink: { color: 'rgba(255,255,255,0.3)', textDecoration: 'none' },
};
