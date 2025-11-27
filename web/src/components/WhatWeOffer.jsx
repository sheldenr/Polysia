import "./WhatWeOffer.css";
import { useEffect } from "react";

function WhatWeOffer() {
  useEffect(() => {
    const update = () => {
      const centerY = window.innerHeight / 2;
      // Smaller radius for a more sudden change
      const radius = Math.max(window.innerHeight * 0.2, 1);
      const placeholders = document.querySelectorAll(".alm-placeholder");
      placeholders.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(centerY - elCenter);
        const t = distance / radius;
        // Cubic falloff to make fade-in more sudden near center
        const ratio = Math.max(0, Math.min(1, 1 - Math.pow(t, 3)));
        el.style.setProperty("--blueOpacity", ratio.toFixed(3));
      });
    };

    let ticking = false;
    const requestTick = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    const scroller = document.scrollingElement || document.documentElement || document.body;
    window.addEventListener("scroll", requestTick, { passive: true });
    document.addEventListener("scroll", requestTick, { passive: true, capture: true });
    scroller.addEventListener && scroller.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);

    // initial paint
    requestTick();

    return () => {
      window.removeEventListener("scroll", requestTick);
      document.removeEventListener("scroll", requestTick, { capture: true });
      scroller.removeEventListener && scroller.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
    };
  }, []);
  return (
    <section className="what-we-offer">
      <div className="divider"></div>
      <div className="offer-container">
        <div className="offer-header">
          <span className="square-bullet" aria-hidden="true"></span>
          <span className="header-label">What we offer</span>
        </div>
        
        <div className="offer-content">
          <h2 className="offer-title">What Polysia can offer</h2>
          <p className="offer-description">
            Polysia combines the latest AI technology with proven language acquisition methods. We provide personalized learning experiences that adapt to your unique needs, helping you achieve fluency faster and more effectively than traditional methods.
          </p>
        </div>

        <div className="alm-sections">
          <div className="alm-item">
            <div className="alm-info">
              <h3 className="alm-title">Personalized Learning Paths</h3>
              <p className="alm-description">
                Polysia adapts to your unique skill level, memory patterns, and learning pace, ensuring every session meets you exactly where you are. As you practice, the system learns what you remember, what you forget, and what you're ready for next. This creates a personalized progression that makes learning feel natural, efficient, and built entirely around you.
              </p>
            </div>
            <div className="alm-placeholder purple">
              <div className="alm-box-glyph" aria-hidden="true">要</div>
            </div>
          </div>

          <div className="alm-item">
            <div className="alm-info">
              <h3 className="alm-title">Real-World Conversation Practice</h3>
              <p className="alm-description">
                Speak naturally with an adaptive AI tutor that adjusts tone, formality, vocabulary, and complexity based on your goals. Whether you're preparing for casual conversations with friends or professional interactions with coworkers, Polysia tailors responses to fit the situation. Every dialogue strengthens your ability to communicate confidently in real-world contexts.
              </p>
            </div>
            <div className="alm-placeholder blue">
              <div className="alm-box-glyph" aria-hidden="true">进</div>
            </div>
          </div>

          <div className="alm-item">
            <div className="alm-info">
              <h3 className="alm-title">Multi-Mode Skill Learning</h3>
              <p className="alm-description">
                Polysia offers targeted learning modes, flashcards, reading, listening, grammar drills, and visual association  to reinforce every aspect of communication. Each mode plays a different role in developing vocabulary, fluency, comprehension, and tone awareness. Together, they create a holistic learning experience that builds lasting confidence across all language skills.
              </p>
            </div>
            <div className="alm-placeholder teal">
              <div className="alm-box-glyph" aria-hidden="true">探</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatWeOffer;
