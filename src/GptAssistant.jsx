import React, { useState, useCallback, lazy, Suspense } from "react";
import { FaBullhorn } from 'react-icons/fa';
import "./GptAssistant.css";
import { useChatReducer } from "./features/assistant/hooks/useChatReducer";
import { MessageList } from "./features/assistant/components/MessageList";
import { DoctorPoster } from "./features/assistant/components/DoctorPoster";
import { Suggestions } from "./features/assistant/components/Suggestions";
import { InputBar } from "./features/assistant/components/InputBar";
import { TopNav } from "./features/assistant/components/TopNav";
import { DEBUG_TOOLS } from "./config";

// Lazy loaded side panels (map & ads) for performance
const MapPanel = lazy(() => import('./features/assistant/components/MapPanel'));
const AdsPanel = lazy(() => import('./features/assistant/components/AdsPanel'));

export default function GptAssistant({ lang = "en" }) {
  const [currentLang, setCurrentLang] = useState(lang);
  const { state, send, selectDoctor, clearChat, retrieveDebug } = useChatReducer(currentLang);
  const { messages, loading, selectedDoctor } = state;

  const copyText = async (t) => { try { await navigator.clipboard.writeText(t || ""); } catch {} };
  const speakText = (t) => { try { const u = new SpeechSynthesisUtterance(t || ""); u.lang = currentLang === "ar" ? "ar-SA" : "en-US"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch {} };
  const suggestions = ["Find me a cardiologist", "Find a pediatrician", "Which doctor is available Monday?"];

  const handleLangChange = useCallback((next) => {
    if (next === currentLang) return;
    setCurrentLang(next);
    clearChat(next); // reset greeting in new language
  }, [currentLang, clearChat]);

  return (
    <div className="gpt-chat-root" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Skip link for keyboard users */}
      <a href="#chat" className="skip-link" aria-label="Skip to chat content">Skip to Chat</a>
      <div className="chat-wrapper">
  <TopNav lang={currentLang} onChangeLang={handleLangChange} />

        <div className="main-grid" role="group" aria-label="Assistant layout">
          {/* Left Panel: Doctor Profile / Context */}
          <aside id="doctor" className="panel left-column" aria-label="Selected doctor details">
            <div className="panel-section stretch">
              <DoctorPoster doctor={selectedDoctor} />
            </div>
          </aside>

          {/* Center Panel: Chat */}
          <section id="chat" className="panel chat-column" aria-label="Conversation" tabIndex={-1}>
            <div className="panel-section grow" aria-live="polite">
              <MessageList
                selectedDoctor={selectedDoctor}
                messages={messages.map(m => ({
                  id: m.id,
                  role: m.role || m.sender,
                  content: m.content || m.text,
                  time: m.time,
                  meta: m.meta || (m.matches ? { matches: m.matches } : undefined)
                }))}
                onCopy={copyText}
                onSpeak={speakText}
                onSelectDoctor={selectDoctor}
                loading={loading}
              />
            </div>
            <div className="input-area panel-section" aria-label="Message input area">
              <Suggestions items={suggestions} onSend={send} />
              <InputBar onSend={send} loading={loading} onClear={clearChat} currentLang={currentLang} onDebug={DEBUG_TOOLS ? retrieveDebug : undefined} />
            </div>
          </section>

          {/* Right Panel: FAQ + Map */}
          <aside id="sidebar" className="panel right-column" aria-label="Supplemental information">
            <div id="faq" className="panel-section">
              <h2 className="panel-title"><FaBullhorn className="ann-icon" /> Announcements</h2>
              <div className="announcement small">A new multi-specialty doctor office is opening soon in this building. Stay tuned for service hours and appointment booking details.</div>
            </div>
            <Suspense fallback={<div className="panel-section" aria-busy="true"><div className="skeleton-title" /><div className="skeleton-block h150" /></div>}>
              <MapPanel />
            </Suspense>
            <Suspense fallback={<div className="panel-section" aria-busy="true"><div className="skeleton-title" /><div className="skeleton-block h120" /></div>}>
              <AdsPanel />
            </Suspense>
          </aside>
        </div>
      </div>
    </div>
  );
}