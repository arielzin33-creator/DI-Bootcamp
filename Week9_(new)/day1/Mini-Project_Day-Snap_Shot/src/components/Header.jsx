import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        📸 SnapShot
      </Link>
    </header>
  )
}

export default Header
