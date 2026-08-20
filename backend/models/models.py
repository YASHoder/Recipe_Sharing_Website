"""
SQLAlchemy models for Tasty Table.
"""
import json
from datetime import datetime, timezone
from backend.extensions import db


# ─────────────────────────────────────────────
# Association table: user ↔ favorite recipes
# ─────────────────────────────────────────────
favorites = db.Table(
    "favorites",
    db.Column("user_id",   db.String(36), db.ForeignKey("users.id"),   primary_key=True),
    db.Column("recipe_id", db.String(36), db.ForeignKey("recipes.id"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"

    id       = db.Column(db.String(36),  primary_key=True)
    name     = db.Column(db.String(120), nullable=False)
    email    = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)   # hashed
    image    = db.Column(db.Text,        nullable=True)     # base64 or URL
    role     = db.Column(db.String(20),  default="user")   # "user" | "admin"
    joined   = db.Column(db.String(30),  nullable=False)

    # Recipes this user authored
    recipes   = db.relationship("Recipe", back_populates="author_user",
                                foreign_keys="Recipe.author_id",
                                cascade="all, delete-orphan")

    # Recipes this user has favorited
    favorited = db.relationship("Recipe", secondary=favorites,
                                back_populates="favorited_by")

    def to_dict(self, include_password=False):
        d = {
            "id":     self.id,
            "name":   self.name,
            "email":  self.email,
            "image":  self.image,
            "role":   self.role,
            "joined": self.joined,
        }
        if include_password:
            d["password"] = self.password
        return d


class Recipe(db.Model):
    __tablename__ = "recipes"

    id          = db.Column(db.String(36),  primary_key=True)
    title       = db.Column(db.String(200), nullable=False)
    category    = db.Column(db.String(50),  nullable=False, default="Mains")
    description = db.Column(db.Text,        nullable=False)
    image       = db.Column(db.Text,        nullable=True)
    time        = db.Column(db.Integer,     default=30)
    servings    = db.Column(db.Integer,     default=4)
    difficulty  = db.Column(db.String(30),  default="Easy")
    rating      = db.Column(db.Float,       default=5.0)
    reviews     = db.Column(db.Integer,     default=0)
    is_default  = db.Column(db.Boolean,     default=False)
    created_at  = db.Column(db.DateTime,    default=lambda: datetime.now(timezone.utc))

    # JSON-serialised lists stored as TEXT
    _ingredients = db.Column("ingredients", db.Text, default="[]")
    _steps       = db.Column("steps",       db.Text, default="[]")
    _tags        = db.Column("tags",        db.Text, default="[]")

    # Author (nullable for built-in seed recipes)
    author_id   = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    author_name = db.Column(db.String(120), nullable=True)   # denormalised for speed

    author_user  = db.relationship("User", back_populates="recipes",
                                   foreign_keys=[author_id])
    favorited_by = db.relationship("User", secondary=favorites,
                                   back_populates="favorited")

    # ── JSON helpers ──────────────────────────────────────────────────────────
    @property
    def ingredients(self):
        try:
            return json.loads(self._ingredients or "[]")
        except Exception:
            return []

    @ingredients.setter
    def ingredients(self, value):
        self._ingredients = json.dumps(value)

    @property
    def steps(self):
        try:
            return json.loads(self._steps or "[]")
        except Exception:
            return []

    @steps.setter
    def steps(self, value):
        self._steps = json.dumps(value)

    @property
    def tags(self):
        try:
            return json.loads(self._tags or "[]")
        except Exception:
            return []

    @tags.setter
    def tags(self, value):
        self._tags = json.dumps(value)

    def to_dict(self, user_id=None):
        return {
            "id":          self.id,
            "title":       self.title,
            "category":    self.category,
            "description": self.description,
            "image":       self.image,
            "time":        self.time,
            "servings":    self.servings,
            "difficulty":  self.difficulty,
            "rating":      self.rating,
            "reviews":     self.reviews,
            "is_default":  self.is_default,
            "author":      self.author_name or "Unknown",
            "authorId":    self.author_id,
            "authorName":  self.author_name,
            "ingredients": self.ingredients,
            "steps":       self.steps,
            "tags":        self.tags,
            "createdAt":   self.created_at.strftime("%m/%d/%Y") if self.created_at else "",
            "isFavorite":  (user_id in [u.id for u in self.favorited_by]) if user_id else False,
        }
