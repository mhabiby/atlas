"""
Compatibility wrapper for older entrypoint behavior.

Run with:
  python -m server.run
or
  python server/semantic_search.py
"""
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from server import create_app

app = create_app()

if __name__ == "__main__":
    app.run(port=5001, debug=True)