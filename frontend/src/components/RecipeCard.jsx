import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import "./RecipeCard.css";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80";

export default function RecipeCard({
  recipe,
}) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!recipe) return null;

  const saved = isFavorite(recipe.id);

  const image =
    recipe.image && recipe.image.trim() !== ""
      ? recipe.image
      : DEFAULT_IMAGE;

  const difficulty =
    recipe.difficulty || "Easy";

  const rating =
    recipe.rating ?? 5;

  const reviews =
    recipe.reviews ?? 0;

  const description =
    recipe.description ||
    "No description available.";

  const cookingTime =
    recipe.time || "--";

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(recipe.id);
  };


  return (
    <article className="card">

      <Link
        to={`/recipes/${recipe.id}`}
        className="card-media"
      >
        <img
          src={image}
          alt={recipe.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = DEFAULT_IMAGE;
          }}
        />

        <span className="card-category">
          {recipe.category}
        </span>
      </Link>

      <div
        className="card-punches"
        aria-hidden="true"
      >
        <span />
        <span />
      </div>

  
      <div className="card-body">

        <div className="card-rule" />

        <Link
          to={`/recipes/${recipe.id}`}
          className="card-title"
        >
          <h3>{recipe.title}</h3>
        </Link>

        <p className="card-desc">
          {description}
        </p>

        <div className="card-meta">
          <span>{cookingTime} min</span>

          <span className="dot">•</span>

          <span>{difficulty}</span>

          <span className="dot">•</span>

          <span>⭐ {rating}</span>

          <span className="dot">•</span>

          <span>{reviews} Reviews</span>
        </div>

    
        <button
          type="button"
          className={`card-save ${
            saved ? "is-saved" : ""
          }`}
          onClick={handleSave}
        >
          {saved ? "Saved" : "Save Recipe"}
        </button>

      </div>

    </article>
  );
}