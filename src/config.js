// Centralized runtime configuration
// Vite exposes vars prefixed with VITE_ via import.meta.env

export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5001').replace(/\/$/, '');
