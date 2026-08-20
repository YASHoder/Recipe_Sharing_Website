import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="container notfound-inner">
        <span className="eyebrow">404</span>
        <h1>This page fell off the counter.</h1>
        <p>We couldn't find what you were looking for. Let's get you back to something worth cooking.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </div>
  )
}
