"""
Admin routes: /api/admin/*  (admin role required for all)
  GET    /users              – list all users
  PUT    /users/:id/role     – promote / demote
  DELETE /users/:id          – delete user
  GET    /recipes            – list all recipes (with search/filter)
  PUT    /recipes/:id        – edit any recipe
  DELETE /recipes/:id        – delete any recipe
  GET    /stats              – dashboard stats
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.extensions import db
from backend.models.models import User, Recipe

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _require_admin():
    """Return (user, error_response). If error_response is not None, return it immediately."""
    uid  = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return None, (jsonify({"error": "User not found."}), 404)
    if user.role != "admin":
        return None, (jsonify({"error": "Admin access required."}), 403)
    return user, None


# ─────────────────────────────────────────────
# STATS
# ─────────────────────────────────────────────
@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    _, err = _require_admin()
    if err:
        return err

    total_users   = User.query.count()
    total_recipes = Recipe.query.count()
    user_recipes  = Recipe.query.filter_by(is_default=False).count()
    default_recipes = Recipe.query.filter_by(is_default=True).count()

    return jsonify({
        "totalUsers":      total_users,
        "totalRecipes":    total_recipes,
        "userRecipes":     user_recipes,
        "defaultRecipes":  default_recipes,
    }), 200


# ─────────────────────────────────────────────
# LIST ALL USERS
# ─────────────────────────────────────────────
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    _, err = _require_admin()
    if err:
        return err

    users = User.query.order_by(User.joined.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


# ─────────────────────────────────────────────
# SET USER ROLE
# ─────────────────────────────────────────────
@admin_bp.route("/users/<user_id>/role", methods=["PUT"])
@jwt_required()
def set_role(user_id):
    admin, err = _require_admin()
    if err:
        return err

    target = db.session.get(User, user_id)
    if not target:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if role not in ("user", "admin"):
        return jsonify({"error": "Role must be 'user' or 'admin'."}), 400

    target.role = role
    db.session.commit()
    return jsonify(target.to_dict()), 200


# ─────────────────────────────────────────────
# DELETE USER
# ─────────────────────────────────────────────
@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    admin, err = _require_admin()
    if err:
        return err

    target = db.session.get(User, user_id)
    if not target:
        return jsonify({"error": "User not found."}), 404

    db.session.delete(target)
    db.session.commit()
    return jsonify({"message": "User deleted."}), 200


# ─────────────────────────────────────────────
# LIST ALL RECIPES (admin view)
# ─────────────────────────────────────────────
@admin_bp.route("/recipes", methods=["GET"])
@jwt_required()
def list_recipes():
    _, err = _require_admin()
    if err:
        return err

    category = request.args.get("category", "All")
    q        = request.args.get("q", "").strip().lower()

    query = Recipe.query

    if category and category != "All":
        query = query.filter_by(category=category)

    if q:
        query = query.filter(
            db.or_(
                Recipe.title.ilike(f"%{q}%"),
                Recipe.author_name.ilike(f"%{q}%"),
            )
        )

    recipes = query.order_by(Recipe.created_at.desc()).all()
    return jsonify([r.to_dict() for r in recipes]), 200


# ─────────────────────────────────────────────
# ADMIN EDIT RECIPE
# ─────────────────────────────────────────────
@admin_bp.route("/recipes/<recipe_id>", methods=["PUT"])
@jwt_required()
def edit_recipe(recipe_id):
    _, err = _require_admin()
    if err:
        return err

    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    data = request.get_json(silent=True) or {}

    if "title"       in data: recipe.title       = data["title"]
    if "category"    in data: recipe.category    = data["category"]
    if "description" in data: recipe.description = data["description"]
    if "image"       in data: recipe.image       = data["image"]
    if "time"        in data: recipe.time        = int(data["time"])
    if "servings"    in data: recipe.servings    = int(data["servings"])
    if "difficulty"  in data: recipe.difficulty  = data["difficulty"]
    if "ingredients" in data: recipe.ingredients = data["ingredients"]
    if "steps"       in data: recipe.steps       = data["steps"]
    if "tags"        in data: recipe.tags        = data["tags"]

    db.session.commit()
    return jsonify(recipe.to_dict()), 200


# ─────────────────────────────────────────────
# ADMIN DELETE RECIPE
# ─────────────────────────────────────────────
@admin_bp.route("/recipes/<recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_recipe(recipe_id):
    _, err = _require_admin()
    if err:
        return err

    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    db.session.delete(recipe)
    db.session.commit()
    return jsonify({"message": "Recipe deleted."}), 200