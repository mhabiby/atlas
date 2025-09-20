from flask import Blueprint, current_app, request, jsonify
import requests
import json
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

    # after performing search (use your VectorSearch.search that returns scores if available)
    results = current_app.search.search(q) if current_app.search else []
    # Add debug logging of raw search results / ids
    current_app.logger.info("Search query=%s, returned %d results", q, len(results))
    for i, r in enumerate(results):
        current_app.logger.info("Result %d: id=%s name=%s specialty=%s", i, r.get("id"), (r.get("name") or {}).get("en") or r.get("name"), r.get("specialty"))

    context = "\n\n".join([
        f"{(d.get('name') or {}).get('en','')} — {d.get('specialty','')}. Availability: {d.get('availability','')}. {d.get('bio','')}"
        for d in results
    ]) or "No relevant doctors found."

    # build system prompt (three concise phrases to constrain the assistant)
    system_prompt = (
        "Use ONLY the provided doctor profiles to answer the user's question.\n"
        "Return matched doctors ranked by relevance with keys: id, name, specialty, availability, one_sentence_bio, contact_if_available.\n"
        "OUTPUT MUST BE A JSON OBJECT ONLY. If no relevant info, return {\"matches\":[], \"note\":\"Information not available in profiles\"}."
    )

    if not Config.OPENAI_API_KEY:
        return jsonify({"error": "OPENAI_API_KEY not configured on server."}), 500

    # Call OpenAI REST API directly to avoid SDK API mismatches
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {Config.OPENAI_API_KEY}", "Content-Type": "application/json"}
        body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": q}
            ],
            "max_tokens": 300,
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

        # try to parse JSON returned as plain text by the model
        matches = None
        try:
            parsed = json.loads(answer)
            if isinstance(parsed, dict) and "matches" in parsed:
                matches = parsed["matches"]
            elif isinstance(parsed, list):
                # allow models that return a list directly
                matches = parsed
        except Exception:
            matches = None

        return jsonify({"answer": answer, "matches": matches, "context": results})
    except Exception as e:
        current_app.logger.error("OpenAI call exception", exc_info=True)
        return jsonify({"error": "LLM request failed", "detail": str(e)}), 502