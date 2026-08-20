import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="nav-brand-mark footer-mark">TT</span>
          <p>
            Tasty Table is a community recipe box: real recipes from real home
            cooks, tested and written the way you'd explain them to a friend.
          </p>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/recipes">All recipes</Link>
            <Link to="/recipes?category=Mains">Mains</Link>
            <Link to="/recipes?category=Desserts">Desserts</Link>
            <Link to="/favorites">Saved recipes</Link>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <Link to="/submit">Share a recipe</Link>
            <Link to="/about">About us</Link>
            <Link to="/about#contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>&copy; {new Date().getFullYear()} Tasty Table. Made for people who cook.</span>
      </div>
    </footer>
  )
}
