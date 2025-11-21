import { Link } from 'react-router-dom';
import logo from '../assets/primary-light.svg';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <img src={logo} height="45rem" alt="Logo" />
        <div className="right-section">
          <ul className="nav-items">
            <li>About</li>
            <li>Research</li>
            <li>Contact</li>
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
