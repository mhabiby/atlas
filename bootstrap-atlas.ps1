/*
Atlas Prototype — Full React App (Vite, **TypeScript fixed**)
-------------------------------------------------------------
✅ This rewrite fixes your error: `SyntaxError: /index.tsx: Unexpected token (18:0)`.
Root cause: raw HTML was pasted into a `.tsx` file and/or the project is TypeScript while the code used `.jsx`.

What changed:
- Converted everything to **TypeScript React (.tsx/.ts)**.
- Removed raw HTML from executable code blocks (HTML is now inside **comments** so it won’t break TS if pasted accidentally).
- Added **Vitest** tests so you can verify routing and language toggle.

👉 **How to apply**
1) Create the files exactly as indicated by each `FILE:` header below.
2) Install deps (including types & test tools).
3) Run the app and tests.

Install runtime deps:
  npm i react-router-dom framer-motion lucide-react react-qr-code

Install dev/test deps:
  npm i -D typescript @types/react @types/react-dom @types/react-router-dom vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

Run app:
  npm run dev

Run tests:
  npm test

Law 09‑08 note: sample data is **business-only** (no PHI) and events are not persisted.
*/

/* ==========================
   FILE: index.html  (create in project root)
   NOTE: This is **HTML**, do not paste into .tsx files. Kept inside a comment to avoid TS errors.
   ==========================
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Atlas Prototype</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
*/

/* ==========================
   FILE: vite.config.ts
   ========================== */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vitest config ensures DOM-like environment for tests
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts'
  }
});

/* ==========================
   FILE: vitest.setup.ts
   ========================== */
import '@testing-library/jest-dom';

/* ==========================
   FILE: src/main.tsx
   ========================== */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

/* ==========================
   FILE: src/global.css
   ========================== */
*{box-sizing:border-box}*::before,*::after{box-sizing:inherit}
html,body,#root{height:100%}
body{margin:0;background:#0b1220;color:#e2e8f0;font-family:system-ui,Segoe UI,Arial,sans-serif}
:root{--vh:1vh}
.app{min-height:calc(var(--vh)*100)}
@supports(height:100dvh){.app{min-height:100dvh}}
.app{display:flex;flex-direction:column}
.app__topbar{flex:0 0 auto}
.app__main{flex:1 1 auto;min-height:0;overflow:auto}
.app__footer{flex:0 0 auto}
.kiosk-grid{height:100%;display:grid;grid-template-columns:2fr 1fr;gap:12px}
.kiosk-left{min-height:0;overflow:auto}
.kiosk-right{min-height:0;display:flex;flex-direction:column;gap:12px}
.kiosk-card{border:1px solid #1f2a44;border-radius:16px;background:rgba(15,23,42,.7);padding:12px}
.button{cursor:pointer;padding:8px 12px;border-radius:10px;border:1px solid #334155;background:transparent;color:#e2e8f0}
.button--active{border-color:#0ea5b7;background:#115e59}
.input{flex:1;background:transparent;border:none;color:#e2e8f0;outline:none}
.card{background:rgba(15,23,42,.7);border:1px solid #1f2a44;border-radius:16px;padding:12px;margin-bottom:8px}
.title{font-weight:700;line-height:1.2}
.muted{color:#94a3b8;font-size:14px}
.subtle{color:#94a3b8;font-size:12px;margin-top:6px}
.qrBtn{display:inline-flex;align-items:center;background:#0e7490;border:1px solid #0ea5b7;color:#fff;padding:8px 12px;border-radius:12px}
.topbar{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2a44;padding:10px 16px}
.stack{display:flex;align-items:center;gap:8px}
.chips{display:flex;gap:8px}
.modalBackdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px}
.modal{width:100%;max-width:420px;background:#0f172a;border:1px solid #334155;border-radius:16px;padding:16px}
.closeBtn{background:transparent;border:none;color:#cbd5e1;font-size:16px;cursor:pointer}

/* ==========================
   FILE: src/types.ts
   ========================== */
export type Lang = 'ar' | 'en';
export type SpecialtyCode = 'cardiology'|'pediatrics'|'radiology'|'dermatology'|'dentistry'|'laboratory'|string;
export type Tenant = {
  id: number;
  name: Record<Lang, string>;
  specialty: SpecialtyCode;
  office: string;
  floor: number;
  tele: string; // external link/QR
};

/* ==========================
   FILE: src/data/sample.ts
   ========================== */
import type { Tenant, Lang, SpecialtyCode } from '../types';

export const SAMPLE: { specialties: { code: SpecialtyCode; en: string; ar: string }[]; tenants: Tenant[] } = {
  specialties: [
    { code: 'cardiology', en: 'Cardiology', ar: 'طب القلب' },
    { code: 'pediatrics', en: 'Pediatrics', ar: 'طب الأطفال' },
    { code: 'radiology', en: 'Radiology', ar: 'الأشعة' },
    { code: 'dermatology', en: 'Dermatology', ar: 'الأمراض الجلدية' },
    { code: 'dentistry', en: 'Dentistry', ar: 'طب الأسنان' },
    { code: 'laboratory', en: 'Laboratory', ar: 'مختبر' }
  ],
  tenants: [
    { id: 1, name: { en: 'Dr. Nadia', ar: 'الدكتورة نادية' }, specialty: 'cardiology', office: 'A-12', floor: 3, tele: 'https://tele.example.ma/nadia' },
    { id: 2, name: { en: 'Dr. Youssef', ar: 'الدكتور يوسف' }, specialty: 'pediatrics', office: 'B-03', floor: 1, tele: 'https://tele.example.ma/youssef' },
    { id: 3, name: { en: 'Atlas Radiology', ar: 'مركز الأشعة أطلس' }, specialty: 'radiology', office: 'C-21', floor: 2, tele: 'https://tele.example.ma/atlas-rad' },
    { id: 4, name: { en: 'Dr. Yasmine Skalli', ar: 'الدكتورة ياسمين سكالي' }, specialty: 'dentistry', office: 'E-11', floor: 2, tele: 'https://tele.example.ma/yasmine-skalli' }
  ]
};

export const STR = {
  title: { en: 'Atlas Directory', ar: 'دليل أطلس' },
  directory: { en: 'Directory', ar: 'الدليل' },
  favorites: { en: 'Favorites', ar: 'المفضلة' },
  search: { en: 'Search by name or specialty', ar: 'ابحث بالاسم أو التخصص' },
  floor: { en: 'Floor', ar: 'الطابق' },
  office: { en: 'Office', ar: 'المكتب' },
  showQR: { en: 'Show QR', ar: 'إظهار الرمز' },
  openLink: { en: 'Open link', ar: 'فتح الرابط' },
  call: { en: 'Call', ar: 'اتصال' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  all: { en: 'All', ar: 'الكل' },
  mapHere: { en: 'Fès Downtown — You are here', ar: 'وسط فاس — أنت هنا' },
  privacy: {
    en: 'Anonymous usage only. QR may open external site.',
    ar: 'بيانات استخدام مجهولة فقط. قد يفتح رمز QR موقعًا خارجيًا.'
  }
} as const;

export const specLabel = (code: SpecialtyCode, lang: Lang): string => (
  SAMPLE.specialties.find(s => s.code === code)?.[lang === 'ar' ? 'ar' : 'en']
) ?? String(code);

/* ==========================
   FILE: src/components/Header.tsx
   ========================== */
import { Globe, MonitorSmartphone, Smartphone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { Lang } from '../types';

export default function Header({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const { pathname } = useLocation();
  const isMobile = pathname.startsWith('/mobile');
  const isKiosk = pathname.startsWith('/kiosk');
  return (
    <div className="topbar app__topbar">
      <div className="stack">
        {isMobile ? <Smartphone size={18} /> : <MonitorSmartphone size={18} />}
        <div style={{ fontWeight: 800, marginInlineStart: 8 }}>Atlas Directory — {isMobile ? 'Mobile' : 'Kiosk'}</div>
      </div>
      <div className="stack">
        <Link to="/mobile"><button className={`button ${isMobile ? 'button--active' : ''}`}>Mobile</button></Link>
        <Link to="/kiosk"><button className={`button ${isKiosk ? 'button--active' : ''}`}>Kiosk</button></Link>
        <Globe size={18} style={{ marginInline: 8 }} />
        <button className={`button ${lang === 'ar' ? 'button--active' : ''}`} onClick={() => setLang('ar')}>AR</button>
        <button className={`button ${lang === 'en' ? 'button--active' : ''}`} onClick={() => setLang('en')}>EN</button>
      </div>
    </div>
  );
}

/* ==========================
   FILE: src/components/TenantCard.tsx
   ========================== */
import { QrCode } from 'lucide-react';
import { STR, specLabel } from '../data/sample';
import type { Lang, Tenant } from '../types';

export default function TenantCard({ t, lang, onQR }: { t: Tenant; lang: Lang; onQR: (t: Tenant) => void }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div className="title">{t.name[lang]}</div>
          <div className="muted">{specLabel(t.specialty, lang)}</div>
          <div className="subtle">{STR.floor[lang]} {t.floor} • {STR.office[lang]} {t.office}</div>
        </div>
        <button className="qrBtn" onClick={() => onQR(t)}>
          <QrCode size={18} /> <span style={{ marginInlineStart: 6 }}>{STR.showQR[lang]}</span>
        </button>
      </div>
    </div>
  );
}

/* ==========================
   FILE: src/components/QRModal.tsx
   ========================== */
import { AnimatePresence, motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { STR } from '../data/sample';
import type { Lang, Tenant } from '../types';

export default function QRModal({ openFor, lang, onClose }: { openFor: Tenant | null; lang: Lang; onClose: () => void }) {
  return (
    <AnimatePresence>
      {openFor && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modalBackdrop" onClick={onClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{openFor.name[lang]}</div>
              <button onClick={onClose} className="closeBtn">✕</button>
            </div>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'grid', placeItems: 'center' }}>
              <QRCode value={openFor.tele} size={220} level="M" />
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#cbd5e1' }}>{STR.privacy[lang]}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ==========================
   FILE: src/pages/Home.tsx
   ========================== */
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Atlas Prototype</h1>
      <p>Choose a mode:</p>
      <div className="stack">
        <Link to="/mobile"><button className="button button--active">Open Mobile</button></Link>
        <Link to="/kiosk"><button className="button">Open Kiosk</button></Link>
      </div>
      <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 24 }}>
        Uses sample data only (no PII). Law 09‑08 compliant demo.
      </p>
    </div>
  );
}

/* ==========================
   FILE: src/pages/Mobile.tsx
   ========================== */
import { useMemo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/Header';
import TenantCard from '../components/TenantCard';
import QRModal from '../components/QRModal';
import { SAMPLE, STR } from '../data/sample';
import type { Lang, Tenant } from '../types';

export default function Mobile() {
  const [lang, setLang] = useState<Lang>('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [q, setQ] = useState('');
  const [spec, setSpec] = useState<string>('all');
  const [qrFor, setQrFor] = useState<Tenant | null>(null);

  // Accurate viewport height on mobile
  useEffect(() => {
    const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    setVH(); window.addEventListener('resize', setVH); window.addEventListener('orientationchange', setVH);
    return () => { window.removeEventListener('resize', setVH); window.removeEventListener('orientationchange', setVH); };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SAMPLE.tenants.filter((t) => {
      const byQ = !term
        || t.name[lang].toLowerCase().includes(term)
        || (SAMPLE.specialties.find((s) => s.code === t.specialty)?.[lang === 'ar' ? 'ar' : 'en'] || '').toLowerCase().includes(term)
        || (t.office || '').toLowerCase().includes(term)
        || String(t.floor).includes(term);
      const byS = spec === 'all' || t.specialty === spec; return byQ && byS;
    });
  }, [q, spec, lang]);

  return (
    <div className="app" style={{ direction: dir as React.CSSProperties['direction'] }}>
      <Header lang={lang} setLang={setLang} />
      <main className="app__main">
        <div className="kiosk-card" style={{ margin: 12 }}>
          <div className="stack" style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
            <Search size={18} color="#2dd4bf" />
            <input className="input" placeholder={STR.search[lang]} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div style={{ marginTop: 8, overflowX: 'auto' }}>
            <div className="chips" style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
              <button className={`button ${spec === 'all' ? 'button--active' : ''}`} onClick={() => setSpec('all')}>{STR.all[lang]}</button>
              {SAMPLE.specialties.map((s) => (
                <button key={s.code} className={`button ${spec === s.code ? 'button--active' : ''}`} onClick={() => setSpec(s.code)}>
                  {lang === 'ar' ? s.ar : s.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: 12, paddingTop: 0 }}>
          {filtered.map((t) => (
            <TenantCard key={t.id} t={t} lang={lang} onQR={setQrFor} />
          ))}
          {filtered.length === 0 && <div className="muted">No results</div>}
        </div>
      </main>
      <QRModal openFor={qrFor} lang={lang} onClose={() => setQrFor(null)} />
    </div>
  );
}

/* ==========================
   FILE: src/pages/Kiosk.tsx
   ========================== */
import { useEffect, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import Header from '../components/Header';
import TenantCard from '../components/TenantCard';
import QRModal from '../components/QRModal';
import { SAMPLE, STR } from '../data/sample';
import type { Lang, Tenant } from '../types';

export default function Kiosk() {
  const [lang, setLang] = useState<Lang>('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [q, setQ] = useState('');
  const [spec, setSpec] = useState<string>('all');
  const [qrFor, setQrFor] = useState<Tenant | null>(null);

  useEffect(() => {
    const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    setVH(); window.addEventListener('resize', setVH); window.addEventListener('orientationchange', setVH);
    return () => { window.removeEventListener('resize', setVH); window.removeEventListener('orientationchange', setVH); };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SAMPLE.tenants.filter((t) => {
      const name = t.name[lang].toLowerCase();
      const sp = (SAMPLE.specialties.find((s) => s.code === t.specialty)?.[lang === 'ar' ? 'ar' : 'en'] || '').toLowerCase();
      const byQ = !term || name.includes(term) || sp.includes(term) || (t.office || '').toLowerCase().includes(term) || String(t.floor).includes(term);
      const byS = spec === 'all' || t.specialty === spec; return byQ && byS;
    });
  }, [q, spec, lang]);

  return (
    <div className="app" style={{ direction: dir as React.CSSProperties['direction'] }}>
      <Header lang={lang} setLang={setLang} />
      <main className="app__main">
        <div className="kiosk-grid" style={{ padding: 12 }}>
          {/* Left: search + list */}
          <section className="kiosk-left">
            <div className="kiosk-card">
              <div className="stack" style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                <Search size={18} color="#2dd4bf" />
                <input className="input" placeholder={STR.search[lang]} value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div style={{ marginTop: 8, overflowX: 'auto' }}>
                <div className="chips" style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                  <button className={`button ${spec === 'all' ? 'button--active' : ''}`} onClick={() => setSpec('all')}>{STR.all[lang]}</button>
                  {SAMPLE.specialties.map((s) => (
                    <button key={s.code} className={`button ${spec === s.code ? 'button--active' : ''}`} onClick={() => setSpec(s.code)}>
                      {lang === 'ar' ? s.ar : s.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {filtered.map((t) => (<TenantCard key={t.id} t={t} lang={lang} onQR={setQrFor} />))}
              {filtered.length === 0 && <div className="muted">No results</div>}
            </div>
          </section>

          {/* Right: map placeholder + ad */}
          <aside className="kiosk-right">
            <div className="kiosk-card" style={{ position: 'relative', height: 220, background: 'linear-gradient(135deg, rgba(3,105,161,0.25), rgba(15,23,42,0.6))' }}>
              <MapPin size={16} style={{ position: 'absolute', top: 10, insetInlineEnd: 10 }} />
              <div style={{ fontSize: 12, color: '#cbd5e1' }}>{STR.mapHere[lang]}</div>
              <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, height: 6, borderRadius: 4, background: '#0f172a' }}>
                <div style={{ height: 6, width: '50%', borderRadius: 4, background: '#14b8a6' }} />
              </div>
            </div>
            <div className="kiosk-card" style={{ textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: 11 }}>Sponsored</div>
              <div style={{ fontSize: 48, padding: '12px 0' }}❤️</div>
              <div style={{ fontWeight: 600 }}>Clinic Promo</div>
            </div>
          </aside>
        </div>
      </main>
      <QRModal openFor={qrFor} lang={lang} onClose={() => setQrFor(null)} />
    </div>
  );
}

/* ==========================
   FILE: src/App.tsx
   ========================== */
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Mobile from './pages/Mobile';
import Kiosk from './pages/Kiosk';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mobile" element={<Mobile />} />
      <Route path="/kiosk" element={<Kiosk />} />
      <Route path="*" element={<Navigate to="/mobile" replace />} />
    </Routes>
  );
}

/* ==========================
   TESTS (added)
   ========================== */
/* FILE: src/__tests__/routing.test.tsx */
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Routing', () => {
  it('renders Home then navigates to Mobile by wildcard', () => {
    render(
      <MemoryRouter initialEntries={["/does-not-exist"]}>
        <App />
      </MemoryRouter>
    );
    // After wildcard redirect, Mobile page should mount (Arabic default)
    expect(screen.getByText(/ابحث بالاسم أو التخصص/i)).toBeInTheDocument();
  });

  it('renders Kiosk when path is /kiosk', () => {
    render(
      <MemoryRouter initialEntries={["/kiosk"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Sponsored/i)).toBeInTheDocument();
  });
});

/* FILE: src/__tests__/i18n.test.tsx */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Mobile from '../pages/Mobile';

// Basic sanity tests for language toggle and search input

describe('Mobile i18n & search', () => {
  it('shows Arabic placeholders by default and switches to EN', () => {
    render(
      <MemoryRouter>
        <Mobile />
      </MemoryRouter>
    );
    // Arabic default
    expect(screen.getByPlaceholderText(/ابحث بالاسم أو التخصص/i)).toBeInTheDocument();

    // Switch to EN
    const enBtn = screen.getByRole('button', { name: 'EN' });
    fireEvent.click(enBtn);

    expect(screen.getByPlaceholderText(/Search by name or specialty/i)).toBeInTheDocument();
  });
});

/* ==========================
   END
   ========================== */
