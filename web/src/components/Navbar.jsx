import { Link } from 'react-router-dom';
import logo from '../assets/primary-light.svg';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <img src={logo} height="45rem" alt="Logo" />
      <div className="right-section">
        <ul className="nav-items">
          <li>About</li>  
          <li>Research</li>
          <li>Contact</li>
        </ul>
        <Link to="/dashboard" className="nav-button">
          Try Polysia
          <span className="arrow-icon">→</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
