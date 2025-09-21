import React, { useEffect, useState } from 'react';
// removed mountain icon branding

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat' },
  { id: 'doctor', label: 'Doctors' },
  { id: 'map', label: 'Map' },
  { id: 'faq', label: 'Announcements' }
];

export function TopNav({ lang = 'en', onChangeLang }) {
  const [active, setActive] = useState('chat');

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#','');
      if (h) setActive(h);
    };
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleClick = (id) => {
    window.location.hash = id;
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start'});
  };

  return (
  <nav className="top-nav-bar" aria-label="Primary">
  <ul className="nav-items" role="menubar" style={{marginLeft:0}}>
        {NAV_ITEMS.map(item => (
          <li key={item.id} role="none">
            <button
              role="menuitem"
              className={`nav-link-btn ${active === item.id ? 'active' : ''}`}
              onClick={() => handleClick(item.id)}
              aria-current={active === item.id ? 'page' : undefined}
            >{item.label}</button>
          </li>
        ))}
      </ul>
      <div className="nav-actions lang-toggle" role="group" aria-label="Language selector">
        <button
          type="button"
          className={`btn btn-sm lang-chip ${lang==='en' ? 'active' : ''}`}
          onClick={() => onChangeLang && onChangeLang('en')}
          aria-pressed={lang==='en'}
        >EN</button>
        <button
          type="button"
          className={`btn btn-sm lang-chip ${lang==='ar' ? 'active' : ''}`}
          onClick={() => onChangeLang && onChangeLang('ar')}
          aria-pressed={lang==='ar'}
        >AR</button>
      </div>
    </nav>
  );
}
