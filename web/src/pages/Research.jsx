import "../components/WhatWeOffer.css";

function Research() {
  return (
    <section className="what-we-offer full-page-white">
      <div className="divider" />
      <div className="offer-container">
        <div className="offer-header">
          <span className="square-bullet" aria-hidden="true"></span>
          <span className="header-label">Research</span>
        </div>

        <div className="offer-content">
          <h2 className="offer-title">Our Research</h2>
          <p className="offer-description">
            Our research focuses on spaced repetition, tone recognition, and
            context-aware reinforcement learning techniques to optimize
            long-term retention of Mandarin. We collaborate with linguists and
            cognitive scientists to validate our approach.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Research;
