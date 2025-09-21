from flask import Blueprint, current_app, request, jsonify
import requests
import json
import time
from .config import Config

bp = Blueprint("api", __name__)

@bp.route("/", methods=["GET"])
def index():
    return (
        "<html><body><h3>Atlas Prototype API</h3>"
        "<p>Use /health and /ask endpoints. Frontend runs separately.</p></body></html>"
    )

@bp.route("/health", methods=["GET"])
def health():
    search = getattr(current_app, "search", None)
    return jsonify({
        "ok": True,
        "index_built": bool(search and search.index is not None),
        "docs_count": len(search.doctors) if search else 0,
        "openai_key_set": bool(Config.OPENAI_API_KEY)
    })

@bp.route("/ask", methods=["POST"])
def ask():
    payload = request.get_json(force=True) or {}
    q = payload.get("question", "")
    if not q or not q.strip():
        return jsonify({"error": "Question is required"}), 400

    started = time.time()
    # Perform semantic search (VectorSearch returns list of {doc, score, idx})
    raw_hits = current_app.search.search(q) if getattr(current_app, "search", None) else []
    # Extract underlying doctor documents & add score
    ranked_docs = []
    for h in raw_hits:
        doc = h.get("doc") if isinstance(h, dict) else None
        if not doc:
            continue
        d_copy = dict(doc)
        d_copy["_score"] = h.get("score")
        ranked_docs.append(d_copy)
    current_app.logger.info("Search query=%s, returned %d results", q, len(ranked_docs))
    for i, d in enumerate(ranked_docs):
        name_en = (d.get("name") or {}).get("en") if isinstance(d.get("name"), dict) else d.get("name")
        current_app.logger.info("Result %d: id=%s name=%s specialty=%s score=%.4f", i, d.get("id"), name_en, d.get("specialty"), d.get("_score", 0.0))

    # Compact profile list for grounding (limit size)
    compact_profiles = []
    for d in ranked_docs:
        name = d.get("name") or {}
        bio = (d.get("bio") or "").strip()
        if len(bio) > 220:
            bio = bio[:217] + "..."
        compact_profiles.append({
            "id": d.get("id"),
            "name_en": name.get("en") if isinstance(name, dict) else name,
            "name_ar": name.get("ar") if isinstance(name, dict) else None,
            "specialty": d.get("specialty"),
            "availability": d.get("availability"),
            "bio": bio,
            "score": round(d.get("_score", 0.0), 4)
        })
    # Truncate if extremely long
    if len(compact_profiles) > 10:
        compact_profiles = compact_profiles[:10]

    # Build system prompt emphasizing strict JSON and grounding
    system_prompt = (
        "You are a retrieval QA assistant. Use ONLY the provided doctor profiles JSON to answer.\n"
        "Respond with a single JSON object: {\"matches\":[{id,name,specialty,availability,one_sentence_bio,contact_if_available}],\"note\"?}.\n"
        "If no suitable doctor, return {\"matches\":[],\"note\":\"No relevant doctors found\"}.\n"
        "Do not hallucinate new doctors. Keep one_sentence_bio under 120 chars."
    )

    if not Config.OPENAI_API_KEY:
        return jsonify({"error": "OPENAI_API_KEY not configured on server."}), 500

    # Call OpenAI REST API directly to avoid SDK API mismatches
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {Config.OPENAI_API_KEY}", "Content-Type": "application/json"}
        grounding_json = json.dumps(compact_profiles, ensure_ascii=False)
        body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": f"PROFILES_JSON: {grounding_json}"},
                {"role": "user", "content": q}
            ],
            "max_tokens": 350,
            "temperature": 0.0
        }
        resp = requests.post(url, headers=headers, json=body, timeout=30)
        if resp.status_code != 200:
            # return detail for debugging (safe for local dev)
            try:
                err_json = resp.json()
            except Exception:
                err_json = {"text": resp.text}
            current_app.logger.error("OpenAI REST error: %s %s", resp.status_code, err_json)
            return jsonify({"error": "LLM request failed", "detail": err_json, "status": resp.status_code}), 502

        data = resp.json()
        answer = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

        # Try to parse JSON
        matches = None
        note = None
        try:
            parsed = json.loads(answer)
            if isinstance(parsed, dict):
                matches = parsed.get("matches")
                note = parsed.get("note")
            elif isinstance(parsed, list):
                matches = parsed
        except Exception:
            matches = None

        # Fallback: derive matches directly from retrieval when model failed
        if matches is None:
            fallback = []
            for d in compact_profiles:
                fallback.append({
                    "id": d["id"],
                    "name": d["name_en"],
                    "specialty": d["specialty"],
                    "availability": d["availability"],
                    "one_sentence_bio": (d["bio"] or "")[:120],
                    "contact_if_available": None
                })
            matches = fallback
            note = note or "LLM parse failed; using retrieval fallback"

        # Attach score into each match when possible (lookup by id)
        score_map = {d.get("id"): d.get("_score") for d in ranked_docs}
        enriched_matches = []
        if isinstance(matches, list):
            for m in matches:
                if isinstance(m, dict):
                    mid = m.get("id")
                    if mid in score_map and "score" not in m:
                        m = {**m, "score": round(score_map[mid] or 0.0, 4)}
                enriched_matches.append(m)
        else:
            enriched_matches = matches

        elapsed_ms = int((time.time() - started) * 1000)
        return jsonify({
            "answer": answer,
            "matches": enriched_matches,
            "note": note,
            "profiles_used": compact_profiles,
            "context": ranked_docs,
            "elapsed_ms": elapsed_ms
        })
    except Exception as e:
        current_app.logger.error("OpenAI call exception", exc_info=True)
        return jsonify({"error": "LLM request failed", "detail": str(e)}), 502


@bp.route("/debug_ask", methods=["POST"])
def debug_ask():
    """Lightweight retrieval-only endpoint (no LLM call) for inspecting raw scores.
    Returns top-k ranked_docs with scores and a compact_profiles list identical to /ask grounding.
    Intended for local diagnostics and UI transparency."""
    payload = request.get_json(force=True) or {}
    q = (payload.get("question") or "").strip()
    if not q:
        return jsonify({"error": "Question is required"}), 400
    started = time.time()
    raw_hits = current_app.search.search(q) if getattr(current_app, "search", None) else []
    ranked_docs = []
    for h in raw_hits:
        doc = h.get("doc") if isinstance(h, dict) else None
        if not doc:
            continue
        d_copy = dict(doc)
        d_copy["_score"] = h.get("score")
        ranked_docs.append(d_copy)

    compact_profiles = []
    for d in ranked_docs:
        name = d.get("name") or {}
        bio = (d.get("bio") or "").strip()
        if len(bio) > 220:
            bio = bio[:217] + "..."
        compact_profiles.append({
            "id": d.get("id"),
            "name_en": name.get("en") if isinstance(name, dict) else name,
            "name_ar": name.get("ar") if isinstance(name, dict) else None,
            "specialty": d.get("specialty"),
            "availability": d.get("availability"),
            "bio": bio,
            "score": round(d.get("_score", 0.0), 4)
        })
    if len(compact_profiles) > 10:
        compact_profiles = compact_profiles[:10]
    elapsed_ms = int((time.time() - started) * 1000)
    return jsonify({
        "question": q,
        "matches": compact_profiles,
        "context": ranked_docs,
        "elapsed_ms": elapsed_ms,
        "note": "Retrieval-only debug; no LLM invoked"
    })