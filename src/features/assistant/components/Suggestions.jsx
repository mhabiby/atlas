import React from 'react';

export function Suggestions({ items, onSend }) {
  if (!items?.length) return null;
  return (
    <div className="suggestions mb-2">
      {items.map(s => (
        <button key={s} className="chip btn btn-sm btn-light me-2 mb-1" onClick={() => onSend(s)}>{s}</button>
      ))}
    </div>
  );
}
