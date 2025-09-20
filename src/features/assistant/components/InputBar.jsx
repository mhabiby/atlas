import React, { useState, useRef, useEffect } from 'react';

export function InputBar({ onSend, loading, onClear }) {
  const [value, setValue] = useState('');
  const taRef = useRef(null);
  const maxLines = 8; // cap growth

  const autoResize = () => {
    const ta = taRef.current;
    if(!ta) return;
    ta.style.height = 'auto';
    const lineHeight = parseInt(window.getComputedStyle(ta).lineHeight || '20',10);
    const maxHeight = lineHeight * maxLines;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
    if(ta.scrollHeight > maxHeight){
      ta.style.overflowY = 'auto';
    } else {
      ta.style.overflowY = 'hidden';
    }
  };

  useEffect(()=>{ autoResize(); }, [value]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if(!value.trim()) return; onSend(value); setValue(''); }
  };
  const doSend = () => { if(!value.trim()) return; onSend(value); setValue(''); };
  return (
    <div className="input-row d-flex gap-2 align-items-stretch position-relative flex-grow-0 flex-shrink-0">
      <div className="flex-grow-1 d-flex flex-column gap-1">
        <textarea
          ref={taRef}
          className="chat-input form-control"
          placeholder="Type your question..."
          rows={1}
          value={value}
          onChange={e=>setValue(e.target.value)}
          onInput={autoResize}
          onKeyDown={handleKey}
          aria-label="Chat input"
          aria-describedby="chat-input-hint"
        />
        <div id="chat-input-hint" className="input-hint muted small" aria-live="off">Press Enter to send • Shift+Enter for newline</div>
      </div>
      <div className="d-flex flex-column flex-md-row gap-2 btn-duo-wrap">
        <button className="chat-btn primary flex-fill" onClick={doSend} disabled={loading || !value.trim()} aria-disabled={loading || !value.trim()} aria-label="Send message">{loading ? '...' : 'Send'}</button>
        <button type="button" className="chat-btn secondary flex-fill" onClick={()=>{ if(window.confirm('Clear the conversation?')) onClear && onClear(); }} disabled={loading} aria-label="Clear chat">Clear</button>
      </div>
    </div>
  );
}
