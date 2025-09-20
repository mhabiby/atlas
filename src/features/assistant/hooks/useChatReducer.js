import { useReducer, useRef, useCallback } from 'react';
import { ask } from '../api/askClient';

function newId(prefix='m'){ return prefix + Math.random().toString(36).slice(2,9); }

const initialState = (lang='en') => ({
  messages: [
    { id: newId(), role: 'assistant', content: lang === 'ar' ? 'مرحبا! كيف أستطيع مساعدتك؟' : 'Hello! How can I help you today?', time: Date.now() }
  ],
  loading: false,
  selectedDoctor: null,
});

function reducer(state, action) {
  switch(action.type){
    case 'SEND':
      return { ...state, messages: [...state.messages, action.message], loading: true };
    case 'RESPONSE':
      return { ...state, messages: [...state.messages, action.message], loading: false, selectedDoctor: action.autoSelect || state.selectedDoctor };
    case 'ERROR':
      return { ...state, messages: [...state.messages, action.message], loading: false };
    case 'SELECT_DOCTOR':
      return { ...state, selectedDoctor: action.doctor };
    case 'CLEAR':
      return initialState(action.lang || 'en');
    default:
      return state;
  }
}

export function useChatReducer(lang){
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(lang));
  const abortRef = useRef(null);

  const send = useCallback((text) => {
    const q = (text || '').trim();
    if(!q || state.loading) return;
    const message = { id: newId(), role: 'user', content: q, time: Date.now() };
    dispatch({ type: 'SEND', message });
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    ask(q, ctrl.signal).then(res => {
      if (res.error) {
        dispatch({ type: 'ERROR', message: { id: newId(), role: 'assistant', content: res.error === 'EMPTY_QUESTION' ? 'Please type a question.' : 'Error: ' + res.error, time: Date.now(), meta: { error: true } } });
        return;
      }
      const matches = res.matches || [];
      const content = matches.length ? `Found ${matches.length} result(s).` : (res.answer || 'No answer returned.');
      dispatch({ type: 'RESPONSE', message: { id: newId(), role: 'assistant', content, time: Date.now(), meta: { matches, elapsedMs: res.elapsedMs } }, autoSelect: matches[0] });
    }).catch(()=>{
      dispatch({ type: 'ERROR', message: { id: newId(), role: 'assistant', content: 'Network error.', time: Date.now(), meta: { error: true } } });
    });
  }, [state.loading]);

  const selectDoctor = useCallback((doc) => dispatch({ type: 'SELECT_DOCTOR', doctor: doc }), []);
  const clearChat = useCallback((nextLang) => {
    if (abortRef.current) try { abortRef.current.abort(); } catch {}
    dispatch({ type: 'CLEAR', lang: nextLang || lang });
  }, [lang]);

  return { state, send, selectDoctor, clearChat };
}
