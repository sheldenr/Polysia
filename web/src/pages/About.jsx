import "../components/WhatWeOffer.css";

function About() {
  return (
    <section className="what-we-offer full-page-white">
      <div className="divider" />
      <div className="offer-container">
        <div className="offer-header">
          <span className="square-bullet" aria-hidden="true"></span>
          <span className="header-label">About</span>
        </div>

        <div className="offer-content">
          <h2 className="offer-title">About Polysia</h2>
          <p className="offer-description">
            Polysia is an adaptive Mandarin learning system that personalizes
            study paths using AI-driven analysis of tones, characters, and
            context. Our mission is to make language learning faster,
            more intuitive, and more enjoyable.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
