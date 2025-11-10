import "./Dashboard.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import favicon from "../assets/favicon.svg";

function NavIcon({ name }) {
  switch (name) {
    case "Learn":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5C4 5.671 4.671 5 5.5 5H12.5C13.881 5 15 6.119 15 7.5V19c0-1.381-1.119-2.5-2.5-2.5H5.5C4.671 16.5 4 17.171 4 18v-11.5Z" fill="currentColor"/>
          <path d="M20 6.5C20 5.671 19.329 5 18.5 5H11.5C10.119 5 9 6.119 9 7.5V19c0-1.381 1.119-2.5 2.5-2.5h6.0c.829 0 1.5.671 1.5 1.5V6.5Z" fill="currentColor" opacity="0.5"/>
        </svg>
      );
    case "Explore":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "Pictures":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/>
          <circle cx="9" cy="11" r="2" fill="currentColor"/>
          <path d="M7 17L13 12L17 15L21 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      );
    case "Guess":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
          <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M6.8 6.8L5.4 5.4M18.6 18.6l-1.4-1.4M6.8 17.2L5.4 18.6M18.6 5.4l-1.4 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case "Count":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="6" width="3" height="12" rx="1" fill="currentColor"/>
          <rect x="10.5" y="10" width="3" height="8" rx="1" fill="currentColor"/>
          <rect x="17" y="4" width="3" height="14" rx="1" fill="currentColor"/>
        </svg>
      );
    default:
      return null;
  }
}

function Dashboard() {
  const [active, setActive] = useState("Learn");

  const items = [
    { key: "Learn" },
    { key: "Explore" },
    { key: "Pictures" },
    { key: "Guess" },
    { key: "Count" },
  ];

  return (
    <section className="dashboard-page">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-top">
            <Link to="/">
              <img src={favicon} alt="Polysia" className="sidebar-logo" />
            </Link>
          </div>
          <nav className="sidebar-nav">
            {items.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${active === item.key ? "active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                <span className="nav-icon" aria-hidden>
                  <NavIcon name={item.key} />
                </span>
                <span className="nav-label">{item.key}</span>
              </button>
            ))}
          </nav>
          <button className="logout-button">Logout</button>
        </aside>

        <main className="dashboard-content">
          <h1 className="section-title">{active}</h1>
          <div className="chatbox">
            <div className="chat-messages">
              <div className="chat-message bot">Welcome back! What would you like to practice today?</div>
              <div className="chat-message user">Let’s review tones for the words I missed yesterday.</div>
              <div className="chat-message bot">Great. I’ll prepare a quick quiz focusing on tone pairs you struggled with.</div>
            </div>
            <div className="chat-input-row">
              <input className="chat-input" placeholder="Type a message..." />
              <button className="chat-send">Send</button>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

export default Dashboard;
