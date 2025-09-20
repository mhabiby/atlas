import os
import requests
import pytest

BASE = os.getenv("ATLAS_SERVER", "http://localhost:5001")

def test_health():
    """Check the backend health endpoint is up and returns expected fields."""
    r = requests.get(f"{BASE}/health", timeout=10)
    assert r.status_code == 200, f"/health returned {r.status_code}: {r.text}"
    data = r.json()
    assert data.get("ok") is True
    assert "docs_count" in data
    assert "index_built" in data
    assert "openai_key_set" in data

def test_ask_endpoint():
    """If OPENAI key is configured on the server, POST to /ask and verify structure.
    Otherwise skip to avoid LLM dependency in CI/dev without a key.
    """
    health = requests.get(f"{BASE}/health", timeout=10).json()
    if not health.get("openai_key_set"):
        pytest.skip("OPENAI_API_KEY not set on server; skipping /ask test")

    payload = {"question": "Find me a cardiologist available on Monday."}
    r = requests.post(f"{BASE}/ask", json=payload, timeout=30)
    assert r.status_code == 200, f"/ask returned {r.status_code}: {r.text}"
    data = r.json()
    assert "answer" in data
    assert isinstance(data.get("answer"), str)
    assert "context" in data
    assert isinstance(data.get("context"), list)