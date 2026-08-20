"""Flask application factory."""
import os
from flask import Flask, send_from_directory, jsonify
from backend.extensions import db, jwt, cors
from backend.routes.auth    import auth_bp
from backend.routes.recipes import recipes_bp
from backend.routes.admin   import admin_bp


def create_app(config=None):
    # Resolve the project root (one level above this package)
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    static_folder = os.path.join(project_root, "frontend", "dist")

    # Disable Flask's built-in static file handler (static_folder=None) so our
    # custom SPA route has full control over all non-/api/ paths.
    app = Flask(
        __name__,
        static_folder=None,   # we handle static files ourselves in serve_spa
    )

    # ── Default config ────────────────────────────────────────────────────────
    app.config.setdefault("SECRET_KEY", os.environ.get("SECRET_KEY", "change-me-in-production"))
    app.config.setdefault(
        "SQLALCHEMY_DATABASE_URI",
        os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(project_root, 'tasty_table.db')}"),
    )
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)
    app.config.setdefault("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "jwt-secret-change-me-in-production!!"))
    app.config.setdefault("JWT_ACCESS_TOKEN_EXPIRES", False)   # tokens don't expire (simplicity)
    app.config.setdefault("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)  # 16 MB upload limit

    if config:
        app.config.update(config)

    # ── Extensions ────────────────────────────────────────────────────────────
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # ── Blueprints ────────────────────────────────────────────────────────────
    # strict_slashes=False on each blueprint so /api/recipes and /api/recipes/
    # both work without a 308 redirect (which breaks POST requests in browsers)
    auth_bp.url_prefix    = "/api/auth"
    recipes_bp.url_prefix = "/api/recipes"
    admin_bp.url_prefix   = "/api/admin"

    app.register_blueprint(auth_bp)
    app.register_blueprint(recipes_bp)
    app.register_blueprint(admin_bp)

    # Disable strict slashes on all API blueprints so trailing-slash variants work
    for rule in app.url_map.iter_rules():
        if str(rule).startswith("/api/"):
            rule.strict_slashes = False

    # ── DB init + seed ────────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()
        from backend.seed import seed_recipes
        seed_recipes()

    # ── Serve React SPA ───────────────────────────────────────────────────────
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        # Serve static assets (JS, CSS, images) if they exist
        full = os.path.join(static_folder, path)
        if path and os.path.exists(full):
            return send_from_directory(static_folder, path)
        # Fall back to index.html for client-side routing
        index = os.path.join(static_folder, "index.html")
        if os.path.exists(index):
            return send_from_directory(static_folder, "index.html")
        return jsonify({"message": "Frontend not built yet. Run: cd frontend && npm install && npm run build"}), 200

    # ── JWT error handlers ────────────────────────────────────────────────────
    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"error": "Missing or invalid token.", "reason": reason}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "Invalid token.", "reason": reason}), 422

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired."}), 401

    return app