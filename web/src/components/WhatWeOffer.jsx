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
          <span className="square-bullet">▪</span>
          <span className="header-label">What we offer</span>
        </div>
        
        <div className="offer-content">
          <h2 className="offer-title">Our custom Adaptive Learning Module.</h2>
          <p className="offer-description">
            Our comprehensive Mandarin learning platform combines cutting-edge AI technology with proven language acquisition methods. We provide personalized learning experiences that adapt to your unique needs, helping you achieve fluency faster and more effectively than traditional methods.
          </p>
        </div>

        <div className="alm-sections">
          <div className="alm-item">
            <div className="alm-info">
              <h3 className="alm-title">Daily Priority</h3>
              <p className="alm-description">
                Start every session with intent. Polysia pinpoints what matters most for your memory graph each day from forgotten tones to weak contextual links so your study time always targets the highest-impact concepts. No guessing, no clutter, just the next most meaningful step toward fluency.
              </p>
            </div>
            <div className="alm-placeholder purple">
              <div className="alm-box-glyph" aria-hidden="true">要</div>
            </div>
          </div>

          <div className="alm-item">
            <div className="alm-info">
              <h3 className="alm-title">Progress at a Glance</h3>
              <p className="alm-description">
                See your learning graph come to life. Track growth through intuitive visuals showing mastered characters, strengthened tone connections, and evolving comprehension zones. Every node, edge, and review reflects how your brain not a generic leaderboard is truly learning.
              </p>
            </div>
            <div className="alm-placeholder blue">
              <div className="alm-box-glyph" aria-hidden="true">进</div>
            </div>
          </div>

          <div className="alm-item">
            <div className="alm-info">
              <h3 className="alm-title">Explore Modules</h3>
              <p className="alm-description">
                Dive into dynamic modules built around real-world Mandarin use from everyday dialogue and idioms to cultural nuance and media comprehension. Each module expands your cognitive graph, letting you explore, connect, and internalize language through interactive discovery rather than rote memorization.
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
