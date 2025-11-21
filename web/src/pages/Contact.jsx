import "../components/WhatWeOffer.css";

function Contact() {
  return (
    <section className="what-we-offer full-page-white">
      <div className="divider" />
      <div className="offer-container">
        <div className="offer-header">
          <span className="square-bullet" aria-hidden="true"></span>
          <span className="header-label">Contact</span>
        </div>

        <div className="offer-content">
          <h2 className="offer-title">Contact</h2>
          <p className="offer-description">
            For inquiries, please email us at <a href="mailto:contact@polysia.app">contact@polysia.app</a>.
            We're happy to answer questions about partnerships, research, and
            early access.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Contact;
