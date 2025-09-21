import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FaPaperPlane, FaMicrophone, FaStop, FaTimes } from 'react-icons/fa';

const SLASH_COMMANDS = [
  { cmd: '/clear', desc: 'Clear conversation' },
  { cmd: '/help', desc: 'Show help tips' },
  { cmd: '/lang en', desc: 'Switch language to English' },
  { cmd: '/lang ar', desc: 'Switch language to Arabic' },
  { cmd: '/doctor', desc: 'Find a doctor' },
  { cmd: '/summary', desc: 'Summarize last answer' }
];

export function InputBar({ onSend, loading, onClear, onCommand }) {
  const [value, setValue] = useState('');
  const [recording, setRecording] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const taRef = useRef(null);
  const listRef = useRef(null);
  const maxLines = 8;

  const autoResize = () => {
    const ta = taRef.current; if(!ta) return; ta.style.height='auto';
    const lineHeight = parseInt(window.getComputedStyle(ta).lineHeight||'20',10);
    const maxHeight = lineHeight * maxLines; ta.style.height = Math.min(ta.scrollHeight, maxHeight)+ 'px';
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };
  useEffect(()=>{ autoResize(); }, [value]);

  // Slash command filtering
  const filteredCommands = useMemo(()=> {
    if(!value.startsWith('/')) return [];
    const term = value.slice(1).toLowerCase();
    return SLASH_COMMANDS.filter(c => c.cmd.slice(1).startsWith(term));
  }, [value]);

  useEffect(()=>{
    if(value.startsWith('/')) {
      setShowSlash(true);
      setSlashIndex(0);
    } else {
      setShowSlash(false);
    }
  }, [value]);

  const executeCommand = useCallback((command) => {
    if(command === '/clear') { onClear && onClear(); setValue(''); return; }
    if(onCommand) onCommand(command);
    setValue('');
  }, [onClear, onCommand]);

  const submit = () => {
    if(!value.trim() || loading) return;
    if(value.startsWith('/') && filteredCommands.length) {
      executeCommand(filteredCommands[0].cmd);
      return;
    }
    onSend(value);
    setValue('');
  };

  const handleKey = (e) => {
    if(showSlash && ['ArrowDown','ArrowUp','Tab'].includes(e.key)) {
      e.preventDefault();
      if(e.key==='ArrowDown' || e.key==='Tab') setSlashIndex(i=> (i+1) % filteredCommands.length);
      if(e.key==='ArrowUp') setSlashIndex(i=> (i-1+filteredCommands.length) % filteredCommands.length);
      return;
    }
    if(e.key==='Enter' && !e.shiftKey){
      e.preventDefault();
      if(showSlash && filteredCommands[slashIndex]) { executeCommand(filteredCommands[slashIndex].cmd); return; }
      if(!value.trim()) return; submit();
    }
    if(e.key==='Escape' && showSlash){ setShowSlash(false); }
  };

  const toggleRecording = () => {
    if(loading) return;
    setRecording(r=>!r);
    // Placeholder: handle actual audio start/stop later
  };

  const clearText = () => setValue('');

  return (
    <div className="chat-input-shell enhanced" role="group" aria-label="Chat input with voice and commands">
      <button type="button" className={`icon-btn mic ${recording ? 'recording' : ''}`} aria-pressed={recording} aria-label={recording ? 'Stop recording' : 'Start recording'} onClick={toggleRecording} disabled={loading}>
        {recording ? <FaStop /> : <FaMicrophone />}
        <span className="pulse" aria-hidden />
      </button>
      <div className="input-stack flex-grow-1 position-relative">
        <textarea
          ref={taRef}
          className="chat-input-inner"
          placeholder="Type or / for commands..."
          rows={1}
          value={value}
          onChange={e=>setValue(e.target.value)}
          onInput={autoResize}
          onKeyDown={handleKey}
          aria-label="Message to assistant"
          aria-autocomplete={showSlash ? 'list' : 'none'}
          aria-expanded={showSlash}
          aria-owns={showSlash ? 'slash-suggestions' : undefined}
        />
        {!!value && (
          <button type="button" className="clear-x" aria-label="Clear text" onClick={clearText}><FaTimes /></button>
        )}
        {showSlash && filteredCommands.length > 0 && (
          <ul id="slash-suggestions" ref={listRef} className="slash-suggestions" role="listbox">
            {filteredCommands.map((c,i)=>(
              <li key={c.cmd} role="option" aria-selected={i===slashIndex} className={i===slashIndex? 'active': ''} onMouseDown={(e)=>{ e.preventDefault(); executeCommand(c.cmd); }}>
                <span className="cmd mono">{c.cmd}</span>
                <span className="desc">{c.desc}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="icon-btn send" aria-label={loading ? 'Stop generation' : 'Send message'} disabled={!value.trim() && !loading} onClick={loading ? ()=>{} : submit}>
        {loading ? <FaStop /> : <FaPaperPlane />}
      </button>
    </div>
  );
}
