from flask import Flask
from flask_cors import CORS
from .routes import bp
from .search import VectorSearch

def create_app():
    app = Flask(__name__)
    # allow frontend dev server to call the API
    CORS(app)

    try:
        app.search = VectorSearch()
        app.logger.info(f"VectorSearch loaded: {len(app.search.doctors)} docs")
    except Exception as e:
        app.search = None
        app.logger.error("Failed to initialize VectorSearch", exc_info=True)

    app.register_blueprint(bp, url_prefix="")
    return app