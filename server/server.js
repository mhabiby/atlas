// NOTE: This file previously contained a hard-coded OpenAI key. Do NOT commit secrets.
// Replace hard-coded key with process.env and do not keep this file if unused.

import express from "express";
import cors from "cors";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY not set. This proxy will not call OpenAI.");
}

// Load doctors knowledge file (local)
let doctors = [];
try {
  doctors = JSON.parse(fs.readFileSync(new URL('./doctors.json', import.meta.url), "utf8"));
} catch (e) {
  console.warn("Could not load doctors.json:", e.message);
}

// Simple retrieval function (local fallback)
function retrieveRelevantDoctors(question) {
  const term = (question || "").toLowerCase();
  return doctors.filter(doc =>
    (doc?.name?.en || "").toLowerCase().includes(term) ||
    (doc?.name?.ar || "").includes(term) ||
    (doc?.specialty || "").toLowerCase().includes(term)
  );
}

// Proxy route example that delegates to Python /ask
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  try {
    const r = await fetch("http://localhost:5001/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

// Local retrieval-only endpoint (no LLM)
app.post('/semantic_search', (req, res) => {
  const q = (req.body?.query || "").toLowerCase();
  const results = retrieveRelevantDoctors(q);
  res.json(results);
});

// If you do not plan to run this Node proxy, delete this file to avoid confusion and remove any embedded keys.
app.listen(3001, () => console.log("Optional proxy running on http://localhost:3001"));

