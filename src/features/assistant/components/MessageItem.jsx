import React, { useState } from 'react';
import { FaMicrophone, FaPen, FaCheck } from 'react-icons/fa';

export function MessageItem({ m, onCopy, onSpeak, onSelectDoctor }) {
  const [copiedAt, setCopiedAt] = useState(null);
  const isUser = m.role === 'user';
  const matches = m.meta?.matches;
  const avatarVisible = m.groupStart;

  const handleCopy = () => {
    onCopy(m.content);
    setCopiedAt(Date.now());
    setTimeout(()=>{ setCopiedAt(null); }, 1500);
  };

  const showCopied = !!copiedAt;

  return (
    <div className={`message mb-1 d-flex ${isUser ? 'from-user' : 'from-assistant'} has-actions ${m.groupStart ? 'group-start' : ''} ${m.groupEnd ? 'group-end' : ''}`}>      
      {avatarVisible ? (
        <div className="msg-avatar me-3" aria-label={isUser ? 'User message' : 'Assistant message'}>{isUser ? 'YOU' : '🤖'}</div>
      ) : (
        <div className="msg-avatar-spacer me-3" aria-hidden="true" />
      )}
      <div className="msg-content">
        <div className="msg-text limited-width">{m.content}</div>
        {Array.isArray(matches) && matches.length > 0 && (
          <div className="table-wrap-compact mt-2">
            <table className="results-table-compact w-100" role="table" aria-label="Search results">
              <thead><tr><th>#</th><th>Name</th><th>Specialty</th><th>Availability</th></tr></thead>
              <tbody>
                {matches.map((mm, idx) => (
                  <tr key={mm.id || idx} role="button" tabIndex={0} className="result-row-compact" onClick={() => onSelectDoctor(mm)} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); onSelectDoctor(mm); } }}>
                    <td className="mono">{idx + 1}</td>
                    <td>{mm.name}</td>
                    <td>{mm.specialty}</td>
                    <td>{mm.availability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="msg-time small text-muted" aria-label="Message time">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    </div>
  );
}
