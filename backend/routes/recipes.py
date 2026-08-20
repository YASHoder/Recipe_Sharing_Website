"""
Recipe routes: /api/recipes/*
  GET    /                  – list all (with optional ?category=&q=&sort=)
  POST   /                  – create new recipe (auth required)
  GET    /:id               – get single recipe
  PUT    /:id               – update recipe (owner or admin)
  DELETE /:id               – delete recipe (owner or admin)
  POST   /:id/favorite      – toggle favorite (auth required)
  GET    /favorites          – list current user's favorites (auth required)
  GET    /my                 – list current user's submitted recipes (auth required)
"""
import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended.exceptions import NoAuthorizationError

from backend.extensions import db
from backend.models.models import Recipe, User

recipes_bp = Blueprint("recipes", __name__, url_prefix="/api/recipes")


def _current_user():
    """Return the User object for the JWT identity, or None."""
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        return db.session.get(User, uid) if uid else None
    except Exception:
        return None


# ─────────────────────────────────────────────
# LIST RECIPES
# ─────────────────────────────────────────────
@recipes_bp.route("/", methods=["GET"])
def list_recipes():
    user = _current_user()
    uid  = user.id if user else None

    category = request.args.get("category", "All")
    q        = request.args.get("q", "").strip().lower()
    sort     = request.args.get("sort", "")   # "rating" | "time" | "newest"

    query = Recipe.query

    if category and category != "All":
        query = query.filter_by(category=category)

    if q:
        query = query.filter(
            db.or_(
                Recipe.title.ilike(f"%{q}%"),
                Recipe.description.ilike(f"%{q}%"),
                Recipe.author_name.ilike(f"%{q}%"),
            )
        )

    if sort == "rating":
        query = query.order_by(Recipe.rating.desc())
    elif sort == "time":
        query = query.order_by(Recipe.time.asc())
    elif sort == "newest":
        query = query.order_by(Recipe.created_at.desc())
    else:
        query = query.order_by(Recipe.created_at.desc())

    recipes = query.all()
    return jsonify([r.to_dict(user_id=uid) for r in recipes]), 200


# ─────────────────────────────────────────────
# GET SINGLE RECIPE
# ─────────────────────────────────────────────
@recipes_bp.route("/<recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    user = _current_user()
    uid  = user.id if user else None

    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404
    return jsonify(recipe.to_dict(user_id=uid)), 200


# ─────────────────────────────────────────────
# CREATE RECIPE
# ─────────────────────────────────────────────
@recipes_bp.route("/", methods=["POST"])
@jwt_required()
def create_recipe():
    uid  = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}

    title       = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    if not title or not description:
        return jsonify({"error": "Title and description are required."}), 400

    recipe = Recipe(
        id=str(uuid.uuid4()),
        title=title,
        category=data.get("category", "Mains"),
        description=description,
        image=data.get("image", ""),
        time=int(data.get("time", 30)),
        servings=int(data.get("servings", 4)),
        difficulty=data.get("difficulty", "Easy"),
        rating=5.0,
        reviews=0,
        is_default=False,
        author_id=uid,
        author_name=user.name,
        created_at=datetime.now(timezone.utc),
    )
    recipe.ingredients = data.get("ingredients", [])
    recipe.steps       = data.get("steps", [])
    recipe.tags        = data.get("tags", [])

    db.session.add(recipe)
    db.session.commit()
    return jsonify(recipe.to_dict(user_id=uid)), 201


# ─────────────────────────────────────────────
# UPDATE RECIPE
# ─────────────────────────────────────────────
@recipes_bp.route("/<recipe_id>", methods=["PUT"])
@jwt_required()
def update_recipe(recipe_id):
    uid  = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "User not found."}), 404

    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    # Only owner or admin can edit
    if recipe.author_id != uid and user.role != "admin":
        return jsonify({"error": "Forbidden."}), 403

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
    return jsonify(recipe.to_dict(user_id=uid)), 200


# ─────────────────────────────────────────────
# DELETE RECIPE
# ─────────────────────────────────────────────
@recipes_bp.route("/<recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_recipe(recipe_id):
    uid  = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "User not found."}), 404

    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    if recipe.author_id != uid and user.role != "admin":
        return jsonify({"error": "Forbidden."}), 403

    db.session.delete(recipe)
    db.session.commit()
    return jsonify({"message": "Recipe deleted."}), 200


# ─────────────────────────────────────────────
# TOGGLE FAVORITE
# ─────────────────────────────────────────────
@recipes_bp.route("/<recipe_id>/favorite", methods=["POST"])
@jwt_required()
def toggle_favorite(recipe_id):
    uid  = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "User not found."}), 404

    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    if recipe in user.favorited:
        user.favorited.remove(recipe)
        favorited = False
    else:
        user.favorited.append(recipe)
        favorited = True

    db.session.commit()
    return jsonify({"favorited": favorited}), 200


# ─────────────────────────────────────────────
# LIST FAVORITES
# ─────────────────────────────────────────────
@recipes_bp.route("/favorites", methods=["GET"])
@jwt_required()
def list_favorites():
    uid  = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "User not found."}), 404

    return jsonify([r.to_dict(user_id=uid) for r in user.favorited]), 200


# ─────────────────────────────────────────────
# MY RECIPES
# ─────────────────────────────────────────────
@recipes_bp.route("/my", methods=["GET"])
@jwt_required()
def my_recipes():
    uid  = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "User not found."}), 404

    recipes = Recipe.query.filter_by(author_id=uid).order_by(Recipe.created_at.desc()).all()
    return jsonify([r.to_dict(user_id=uid) for r in recipes]), 200