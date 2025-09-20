import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageItem } from './MessageItem';

export function MessageList({ messages, onCopy, onSpeak, onSelectDoctor, loading }) {
  const endRef = useRef(null);
  const containerRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [missedCount, setMissedCount] = useState(0);
  const bottomThreshold = 40; // px tolerance

  const scrollToBottom = useCallback((smooth = true) => {
    try { endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth':'auto', block: 'end'}); } catch {}
  }, []);

  // observe scroll offset
  useEffect(()=>{
    const el = containerRef.current;
    if(!el) return;
    const handle = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const nowAtBottom = distance <= bottomThreshold;
      setAtBottom(nowAtBottom);
      if(nowAtBottom) { setMissedCount(0); }
    };
    el.addEventListener('scroll', handle, { passive:true });
    handle();
    return ()=> el.removeEventListener('scroll', handle);
  }, []);

  // when messages change
  useEffect(()=>{
    if(atBottom) {
      scrollToBottom();
    } else {
      // increment missed new assistant/user messages (only count last append)
      setMissedCount(c => c + 1);
    }
  }, [messages, atBottom, scrollToBottom]);

  const enriched = messages.map((m, idx) => {
    const prev = messages[idx - 1];
    const next = messages[idx + 1];
    const samePrev = prev && (prev.role === m.role);
    const sameNext = next && (next.role === m.role);
    return {
      ...m,
      groupStart: !samePrev,
      groupEnd: !sameNext
    };
  });

  return (
    <div className="messages-window flex-grow-1 overflow-auto mb-3 position-relative" role="log" aria-live="polite" ref={containerRef}>
      {enriched.map(m => (
        <MessageItem key={m.id} m={m} onCopy={onCopy} onSpeak={onSpeak} onSelectDoctor={onSelectDoctor} />
      ))}
      {loading && (
        <div className="message skeleton-msg">
          <div className="msg-avatar skeleton-block" aria-hidden="true" />
          <div className="msg-content" aria-hidden="true">
            <div className="skeleton-line w60" />
            <div className="skeleton-line w80" />
            <div className="skeleton-line w40" />
          </div>
        </div>
      )}
      <div ref={endRef} />
      {!atBottom && (
        <button
          type="button"
            className="scroll-latest-btn"
            aria-label={missedCount ? `Scroll to latest messages. ${missedCount} new` : 'Scroll to latest messages'}
            onClick={()=>{ scrollToBottom(); setTimeout(()=>setMissedCount(0), 400); }}>
          <span className="label">Latest</span>
          {missedCount > 0 && <span className="badge" aria-hidden="true">{missedCount}</span>}
        </button>
      )}
    </div>
  );
}
