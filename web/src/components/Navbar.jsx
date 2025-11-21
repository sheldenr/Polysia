import { Link } from 'react-router-dom';
import logo from '../assets/primary-light.svg';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
        <div className="navbar-inner">
        <Link to="/">
          <img src={logo} height="45rem" alt="Logo" />
        </Link>
        <div className="right-section">
          <ul className="nav-items">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/research">Research</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
          <div className="nav-button">
            Sign In
            <span className="arrow-icon">→</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
