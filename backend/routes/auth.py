"""
Auth routes: /api/auth/*
  POST /register
  POST /login
  POST /logout
  GET  /me
  PUT  /me
  DELETE /me
"""
import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    unset_jwt_cookies,
)
from werkzeug.security import generate_password_hash, check_password_hash

from backend.extensions import db
from backend.models.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

ADMIN_CODE = "TASTY-ADMIN-2024"


# ─────────────────────────────────────────────
# REGISTER
# ─────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name       = (data.get("name") or "").strip()
    email      = (data.get("email") or "").strip().lower()
    password   = data.get("password") or ""
    image      = data.get("image") or ""
    admin_code = (data.get("adminCode") or "").strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists."}), 409

    is_first = User.query.count() == 0
    role = "admin" if (is_first or admin_code == ADMIN_CODE) else "user"

    user = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        password=generate_password_hash(password),
        image=image,
        role=role,
        joined=datetime.now(timezone.utc).strftime("%m/%d/%Y"),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 201


# ─────────────────────────────────────────────
# LOGIN
# ─────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "That email and password combination doesn't match our records."}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 200


# ─────────────────────────────────────────────
# LOGOUT  (client just discards the token; this is a convenience endpoint)
# ─────────────────────────────────────────────
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    response = jsonify({"message": "Logged out."})
    unset_jwt_cookies(response)
    return response, 200


# ─────────────────────────────────────────────
# GET CURRENT USER
# ─────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify(user.to_dict()), 200


# ─────────────────────────────────────────────
# UPDATE PROFILE
# ─────────────────────────────────────────────
@auth_bp.route("/me", methods=["PUT", "PATCH"])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data and data["name"].strip():
        user.name = data["name"].strip()
    if "email" in data and data["email"].strip():
        new_email = data["email"].strip().lower()
        existing = User.query.filter_by(email=new_email).first()
        if existing and existing.id != user_id:
            return jsonify({"error": "Email already in use."}), 409
        user.email = new_email
    if "image" in data:
        user.image = data["image"]
    if "password" in data and data["password"]:
        if len(data["password"]) < 6:
            return jsonify({"error": "Password must be at least 6 characters."}), 400
        user.password = generate_password_hash(data["password"])

    db.session.commit()
    return jsonify(user.to_dict()), 200


# ─────────────────────────────────────────────
# DELETE ACCOUNT
# ─────────────────────────────────────────────
@auth_bp.route("/me", methods=["DELETE"])
@jwt_required()
def delete_me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Account deleted."}), 200