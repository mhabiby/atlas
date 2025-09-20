import os
from dotenv import load_dotenv
import yaml

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# load .env from project root (optional)
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# optional YAML config (project root)
_yaml_cfg = {}
_yaml_path = os.path.join(PROJECT_ROOT, "config.yaml")
if os.path.exists(_yaml_path):
    try:
        with open(_yaml_path, "r", encoding="utf-8") as f:
            _yaml_cfg = yaml.safe_load(f) or {}
    except Exception:
        _yaml_cfg = {}

def _get(key, default=None):
    env_key = key.upper()
    return os.getenv(env_key, _yaml_cfg.get(key, default))

class Config:
    DOCTORS_PATH = os.path.join(PROJECT_ROOT, _get("doctors_path", "server/doctors.json"))
    EMBED_MODEL = _get("embed_model", "all-MiniLM-L6-v2")
    TOP_K = int(_get("top_k", 3))
    OPENAI_API_KEY = _get("openai_api_key", os.getenv("OPENAI_API_KEY", ""))