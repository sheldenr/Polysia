import "./EarlyAccess.css";

function EarlyAccess() {
  return (
    <section className="early-access">
      <div className="early-access-container">
        <div className="early-access-header">
          <span className="square-bullet" aria-hidden="true"></span>
          <span className="header-label">Join the waitlist</span>
        </div>
        
        <div className="early-access-content">
          <h2 className="early-access-title">Get early access to Polysia.</h2>
          <p className="early-access-description">
            Be among the first to experience our revolutionary Mandarin learning platform. Sign up now to receive updates and early access when we launch.
          </p>
        </div>

        <div className="early-access-form">
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="email-input"
          />
          <button className="submit-button">
            Sign Up
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default EarlyAccess;

