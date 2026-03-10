import Head from 'next/head';
import Link from 'next/link';
import { useState, useCallback, useRef } from 'react';

// ── Markdown → HTML ──────────────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mdToHtml(md) {
  let html = md;
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="language-${lang}">${escHtml(code.trim())}</code></pre>`
  );
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm,  '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm,   '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm,    '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,     '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,      '<h1>$1</h1>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr />');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g,         '<em>$1</em>');
  html = html.replace(/__(.+?)__/g,         '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g,           '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g,         '<del>$1</del>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,  '<a href="$2">$1</a>');
  html = html.replace(/(^[*\-+] .+(\n[*\-+] .+)*)/gm, (block) => {
    const items = block.split('\n').map((l) => `  <li>${l.replace(/^[*\-+] /, '')}</li>`).join('\n');
    return `<ul>\n${items}\n</ul>`;
  });
  html = html.replace(/(^\d+\. .+(\n\d+\. .+)*)/gm, (block) => {
    let i = 1;
    const items = block.split('\n').map((l) => `  <li>${l.replace(/^\d+\. /, '')}</li>`).join('\n');
    return `<ol>\n${items}\n</ol>`;
  });
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|ul|ol|blockquote|pre|hr)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n\n');
  return html;
}

// ── HTML → Markdown ──────────────────────────────────────────────────────────
function htmlToMd(html) {
  return html
    .replace(/<h([1-6])>(.*?)<\/h[1-6]>/gi, (_, n, t) => '#'.repeat(+n) + ' ' + t + '\n')
    .replace(/<strong><em>(.*?)<\/em><\/strong>/gi, '***$1***')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi,         '*$1*')
    .replace(/<del>(.*?)<\/del>/gi,       '~~$1~~')
    .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```')
    .replace(/<code>(.*?)<\/code>/gi,     '`$1`')
    .replace(/<a href="([^"]+)">(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img src="([^"]+)" alt="([^"]*)"\s*\/?>/gi, '![$2]($1)')
    .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1')
    .replace(/<hr\s*\/?>/gi, '---')
    .replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, inner) =>
      inner.replace(/<li>(.*?)<\/li>/gi, '- $1\n').trim()
    )
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, inner) => {
      let i = 1;
      return inner.replace(/<li>(.*?)<\/li>/gi, () => `${i++}. $1\n`).trim();
    })
    .replace(/<p>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .trim();
}

function getStats(text) {
  return {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    chars: text.length,
    lines: text.split('\n').length,
  };
}

const DEFAULT_MD = `# Welcome to MD ↔ HTML Converter

Convert **Markdown** to *HTML* and back — instantly, in your browser.

## Features

- Live preview as you type
- Two-way conversion (MD → HTML and HTML → MD)
- Copy output with one click
- Swap input ↔ output with one click

## Code Example

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));
\`\`\`

> "Simplicity is the soul of efficiency." — Austin Freeman

---

### Inline Formatting

You can use **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

### Links & Images

[Visit OpenAI](https://openai.com)

### Lists

1. First item
2. Second item
3. Third item

- Bullet one
- Bullet two
- Bullet three
`;

// ── AdSense slot (replace with real ad unit) ─────────────────────────────────
function AdSlot({ label, height = 90 }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height,
      fontSize: '11px',
      color: 'rgba(255,255,255,0.18)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Replace this div with your real AdSense <ins> tag */}
      {label}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [mode, setMode]           = useState('md2html');
  const [input, setInput]         = useState(DEFAULT_MD);
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied]       = useState(false);
  const [toast, setToast]         = useState('');
  const textareaRef               = useRef(null);

  const output = mode === 'md2html' ? mdToHtml(input) : htmlToMd(input);
  const stats  = getStats(input);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleSwap = () => {
    setInput(output);
    setMode((m) => (m === 'md2html' ? 'html2md' : 'md2html'));
    showToast('✓ Output moved to input');
  };

  return (
    <>
      <Head>
        <title>Markdown ↔ HTML Converter — Free Online Tool</title>
        <meta name="description" content="Free online Markdown to HTML converter with live preview. Instantly convert Markdown to HTML or HTML to Markdown in your browser. No signup needed." />
        <meta name="keywords" content="markdown to html, html to markdown, markdown converter, md to html, online markdown editor, live preview" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Markdown ↔ HTML Converter — Free Online Tool" />
        <meta property="og:description" content="Convert Markdown to HTML and back with live preview. Free, fast, no signup." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⇄</text></svg>" />

        {/* Google AdSense — replace with your publisher ID */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
      </Head>

      <div style={s.root}>
        {/* ── Top Ad ── */}
        <div style={s.adWrap}>
          <AdSlot label="Advertisement · 728×90" />
        </div>

        {/* ── Header ── */}
        <header style={s.header}>
          <div style={s.brand}>
            <span style={s.brandIcon}>⇄</span>
            <div>
              <h1 style={s.brandName}>MD ↔ HTML</h1>
              <p style={s.brandSub}>Free Markdown Converter with Live Preview</p>
            </div>
          </div>

          <div style={s.controls}>
            <div style={s.modeGroup}>
              <button style={s.modeBtn(mode === 'md2html')} onClick={() => setMode('md2html')}>MD → HTML</button>
              <button style={s.modeBtn(mode === 'html2md')} onClick={() => setMode('html2md')}>HTML → MD</button>
            </div>
            <button style={s.swapBtn} onClick={handleSwap}>⇅ Swap</button>
            <Link href="/about" style={s.navLink}>About</Link>
            <Link href="/privacy" style={s.navLink}>Privacy</Link>
          </div>
        </header>

        {/* ── Editor workspace ── */}
        <main style={s.workspace}>
          {/* Input panel */}
          <div style={s.panel}>
            <div style={s.panelBar}>
              <span style={s.panelLabel}>
                <span style={s.dot(mode === 'md2html' ? '#6ee7b7' : '#fb923c')} />
                {mode === 'md2html' ? 'Markdown' : 'HTML'} Input
              </span>
              <div style={s.barActions}>
                <button style={s.barBtn} onClick={() => { setInput(''); textareaRef.current?.focus(); }}>✕ Clear</button>
                <button style={s.barBtn} onClick={() => navigator.clipboard.readText().then(t => setInput(t)).catch(() => {})}>⊕ Paste</button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              style={s.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'md2html' ? '# Type Markdown here...' : '<h1>Type HTML here...</h1>'}
              spellCheck={false}
            />
          </div>

          {/* Output panel */}
          <div style={s.panel}>
            <div style={s.panelBar}>
              <div style={s.tabs}>
                <button style={s.tab(activeTab === 'preview')} onClick={() => setActiveTab('preview')}>👁 Preview</button>
                <button style={s.tab(activeTab === 'source')}  onClick={() => setActiveTab('source')}>&lt;/&gt; Source</button>
              </div>
              <button
                style={{ ...s.barBtn, color: copied ? '#6ee7b7' : undefined }}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : '⎘ Copy'}
              </button>
            </div>
            {activeTab === 'preview' ? (
              <div
                className="preview-content"
                style={s.preview}
                dangerouslySetInnerHTML={{ __html: output }}
              />
            ) : (
              <pre style={s.source}>{output}</pre>
            )}
          </div>
        </main>

        {/* ── Stats bar ── */}
        <div style={s.statsBar}>
          {[['Lines', stats.lines], ['Words', stats.words], ['Chars', stats.chars]].map(([k, v]) => (
            <span key={k} style={s.stat}>{k}: <b style={s.statVal}>{v}</b></span>
          ))}
          <span style={{ flex: 1 }} />
          <span style={s.stat}>Mode: <b style={s.statVal}>{mode === 'md2html' ? 'Markdown → HTML' : 'HTML → Markdown'}</b></span>
        </div>

        {/* ── Mid Ad (between editor and info) ── */}
        <div style={s.adWrap}>
          <AdSlot label="Advertisement · 728×90" />
        </div>

        {/* ── SEO content block (helps AdSense approval) ── */}
        <section style={s.info}>
          <div style={s.infoGrid}>
            <div style={s.infoCard}>
              <h2 style={s.infoTitle}>What is Markdown?</h2>
              <p style={s.infoText}>
                Markdown is a lightweight markup language that lets you add formatting to plain text.
                Created by John Gruber in 2004, it&apos;s used in GitHub READMEs, documentation, blogs, and chat apps.
              </p>
            </div>
            <div style={s.infoCard}>
              <h2 style={s.infoTitle}>How to use this tool</h2>
              <p style={s.infoText}>
                Paste or type your Markdown in the left panel. The right panel shows the rendered HTML preview instantly.
                Switch to <strong style={{ color: '#6ee7b7' }}>Source</strong> to see the raw HTML output, then copy it with one click.
              </p>
            </div>
            <div style={s.infoCard}>
              <h2 style={s.infoTitle}>Markdown Cheatsheet</h2>
              <div style={s.cheatsheet}>
                {[
                  ['# Heading 1', 'h1 tag'],
                  ['**bold**', 'Bold text'],
                  ['*italic*', 'Italic text'],
                  ['`code`', 'Inline code'],
                  ['[text](url)', 'Link'],
                  ['> quote', 'Blockquote'],
                  ['- item', 'List item'],
                  ['---', 'Horizontal rule'],
                ].map(([md, desc]) => (
                  <div key={md} style={s.cheatRow}>
                    <code style={s.cheatCode}>{md}</code>
                    <span style={s.cheatDesc}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom Ad ── */}
        <div style={s.adWrap}>
          <AdSlot label="Advertisement · 728×90" />
        </div>

        {/* ── Footer ── */}
        <footer style={s.footer}>
          <span>MD ↔ HTML Converter · Free Online Tool · No signup required</span>
          <span style={{ display: 'flex', gap: 20 }}>
            <Link href="/about" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>About</Link>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Privacy</Link>
          </span>
        </footer>

        {/* ── Toast ── */}
        {toast && <div style={s.toast}>{toast}</div>}
      </div>
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const MONO = "'JetBrains Mono', monospace";
const SANS = "'Syne', sans-serif";
const GREEN = '#6ee7b7';

const s = {
  root: { minHeight: '100vh', background: '#0d0e11', color: '#e2e8f0', fontFamily: SANS, display: 'flex', flexDirection: 'column', gap: '0' },
  adWrap: { padding: '12px 24px' },

  header: { padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandIcon: { width: 38, height: 38, background: 'linear-gradient(135deg,#6ee7b7,#3b82f6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  brandName: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg,#6ee7b7,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  brandSub: { fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', marginTop: 2 },

  controls: { display: 'flex', alignItems: 'center', gap: '8px' },
  modeGroup: { display: 'flex', background: '#1a1c23', borderRadius: 10, padding: 4, gap: 4, border: '1px solid rgba(255,255,255,0.07)' },
  modeBtn: (a) => ({ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 12, fontWeight: 600, transition: 'all .2s', background: a ? 'linear-gradient(135deg,#6ee7b722,#3b82f622)' : 'transparent', color: a ? GREEN : 'rgba(255,255,255,0.35)' }),
  swapBtn: { background: 'linear-gradient(135deg,#6ee7b720,#3b82f620)', border: '1px solid #6ee7b740', color: GREEN, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontFamily: MONO, fontWeight: 600, cursor: 'pointer' },
  navLink: { fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.04em' },

  workspace: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 24px', flex: 1, minHeight: 500 },
  panel: { background: '#13151c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 480 },
  panelBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0f1116', flexShrink: 0 },
  panelLabel: { fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 },
  dot: (c) => ({ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0 }),
  barActions: { display: 'flex', gap: 6 },
  barBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px 10px', fontSize: 11, fontFamily: MONO, transition: 'all .15s' },

  textarea: { flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: 16, fontFamily: MONO, fontSize: 13, lineHeight: 1.7, color: '#c9d1d9', caretColor: GREEN, tabSize: 2 },

  tabs: { display: 'flex', gap: 0 },
  tab: (a) => ({ padding: '7px 14px', fontSize: 11, fontFamily: MONO, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: a ? GREEN : 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', borderBottom: a ? `2px solid ${GREEN}` : '2px solid transparent', cursor: 'pointer', transition: 'all .15s' }),

  preview: { flex: 1, padding: 16, overflow: 'auto', fontSize: 14, lineHeight: 1.75, color: '#d1d9e0' },
  source: { flex: 1, padding: 16, overflow: 'auto', fontFamily: MONO, fontSize: 12, lineHeight: 1.7, color: '#8b949e', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 },

  statsBar: { display: 'flex', gap: 20, padding: '8px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0f1116', flexWrap: 'wrap' },
  stat: { fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.25)', display: 'flex', gap: 4 },
  statVal: { color: 'rgba(255,255,255,0.55)', fontWeight: 600 },

  info: { padding: '24px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 },
  infoCard: { background: '#13151c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 },
  infoTitle: { fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 10 },
  infoText: { fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' },

  cheatsheet: { display: 'flex', flexDirection: 'column', gap: 6 },
  cheatRow: { display: 'flex', alignItems: 'center', gap: 10 },
  cheatCode: { background: '#1e2230', color: '#79c0ff', padding: '2px 8px', borderRadius: 4, fontFamily: MONO, fontSize: 12, minWidth: 120, flexShrink: 0 },
  cheatDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  footer: { padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: MONO },
  toast: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1a2e1a', border: '1px solid #6ee7b740', color: GREEN, borderRadius: 8, padding: '10px 20px', fontFamily: MONO, fontSize: 12, zIndex: 999, animation: 'fadeIn 0.2s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' },
};
