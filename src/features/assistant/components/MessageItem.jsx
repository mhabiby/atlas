import React, { useState } from 'react';
import { FaMicrophone, FaPen, FaCheck, FaUser } from 'react-icons/fa';

export function MessageItem({ m, onCopy, onSpeak, onSelectDoctor, selectedDoctor }) {
  const [copiedAt, setCopiedAt] = useState(null);
  const isUser = m.role === 'user';
  const matches = m.meta?.matches;
  const note = m.meta?.note;
  const avatarVisible = m.groupStart;

  const handleCopy = () => {
    onCopy(m.content);
    setCopiedAt(Date.now());
    setTimeout(()=>{ setCopiedAt(null); }, 1500);
  };

  const showCopied = !!copiedAt;

  const isDebug = !!m.meta?.debug;
  const elapsed = m.meta?.elapsedMs;
  const fallback = note && /fallback/i.test(note);

  return (
    <div className={`message mb-1 d-flex ${isUser ? 'from-user' : 'from-assistant'} has-actions ${m.groupStart ? 'group-start' : ''} ${m.groupEnd ? 'group-end' : ''}`}>      
      {avatarVisible ? (
        <div className="msg-avatar me-3" aria-label={isUser ? 'User message' : 'Assistant message'}>{isUser ? <FaUser /> : '🤖'}</div>
      ) : (
        <div className="msg-avatar-spacer me-3" aria-hidden="true" />
      )}
      <div className="msg-content">
        <div className="msg-text limited-width">{m.content}</div>
        {note && !isUser && (
          <div className="mt-2 small" style={{background: fallback ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.08)', padding:'6px 10px', borderRadius:8, border: fallback ? '1px solid rgba(250,204,21,0.4)' : '1px solid rgba(255,255,255,0.05)'}} aria-live="polite">
            {fallback && <strong className="mono" style={{marginRight:6, color:'#facc15'}}>FALLBACK:</strong>}{note}
          </div>
        )}
        {Array.isArray(matches) && matches.length > 0 && (
          <div className="table-wrap-compact mt-2" role="group" aria-label="Related doctor matches">
            <table className="results-table-compact w-100" role="table">
              <caption className="visually-hidden">Doctor search matches returned for this answer</caption>
              <thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Specialty</th><th scope="col">Availability</th><th scope="col">Score</th></tr></thead>
              <tbody>
                {matches.map((mm, idx) => {
                  const isSel = selectedDoctor && (selectedDoctor.id === mm.id);
                  return (
                  <tr key={mm.id || idx} role="button" tabIndex={0} className={`result-row-compact ${isSel ? 'selected' : ''}`} onClick={() => onSelectDoctor(mm)} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onSelectDoctor(mm); } }}>
                    <td className="mono" aria-label={`Result ${idx+1}`}>{idx + 1}</td>
                    <td>{mm.name}</td>
                    <td>{mm.specialty}</td>
                    <td>{mm.availability}</td>
                    <td className="mono small" style={{opacity:.8}}>{typeof mm.score === 'number' ? mm.score.toFixed(3) : ''}</td>
                  </tr>
                );})}
              </tbody>
            </table>
            <div className="results-stack" aria-hidden="true">
              {matches.map((mm, idx) => {
                const isSel = selectedDoctor && (selectedDoctor.id === mm.id);
                return (
                <div key={'stack-'+(mm.id||idx)} className={`result-card ${isSel ? 'selected' : ''}`} onClick={()=>onSelectDoctor(mm)}>
                  <div className="d-flex align-items-center justify-content-between mb-1"><span className="mono small">#{idx+1}</span><span className="badge bg-secondary" style={{background:'rgba(255,255,255,0.1)', color:'#fff'}}>{mm.specialty}</span></div>
                  <div className="fw-semibold mb-1">{mm.name}</div>
                  <div className="small muted">Availability: {mm.availability}</div>
                  {typeof mm.score === 'number' && <div className="small" style={{marginTop:4}}>Score: <span className="mono">{mm.score.toFixed(3)}</span></div>}
                </div>
              );})}
            </div>
          </div>
        )}
        <div className="msg-meta mt-1 d-flex align-items-center justify-content-between">
          <div className="msg-actions fade-reveal" aria-label="Message actions">
            <button className={`btn btn-sm btn-link msg-action icon-only copy-btn ${showCopied ? 'copied' : ''}`} onClick={handleCopy} title={showCopied ? 'Copied' : 'Copy message'} aria-label={showCopied ? 'Copied' : 'Copy message'}>
              {showCopied ? <FaCheck /> : <FaPen />}
            </button>
            <button className="btn btn-sm msg-action mic-btn" onClick={() => onSpeak(m.content)} title="Play audio" aria-label="Play audio">
              <FaMicrophone />
            </button>
          </div>
          <div className="msg-time small text-muted d-flex align-items-center gap-2" aria-label="Message meta info">
            {isDebug && <span className="badge mono" style={{background:'rgba(99,102,241,0.25)', color:'#c7d2fe', fontSize:10, padding:'2px 6px', borderRadius:6}}>DEBUG</span>}
            {typeof elapsed === 'number' && <span className="mono" style={{opacity:.65}}>{elapsed}ms</span>}
            {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}
