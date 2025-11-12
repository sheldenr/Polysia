import "./Hero.css";

function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-row">
            <span className="start-learning">
              <span className="square-bullet">▪</span> Start learning now
            </span>
          </div>

          <div className="hero-row">
            <h1 className="hero-title">
              The only adaptive system built for the complexities of Mandarin.
            </h1>
          </div>

          <div className="hero-row">
            <p className="hero-description">
              We analyze your tones, characters, and weak spots in real-time. Start the adaptive task below to optimize your daily memory retention.
            </p>
          </div>

          <div className="hero-row">
            <button className="action-button">
              See it in Action
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="chinese-scroll-section">
        <div className="chinese-scroll-container">
          <div className="chinese-scroll-content">
            <span>你好</span>
            <span>谢谢</span>
            <span>不客气</span>
            <span>再见</span>
            <span>早上好</span>
            <span>这太让我失望了</span>
            <span>请问</span>
            <span>对不起</span>
            <span>没关系</span>
            <span>真的假的</span>
            <span>我很忙</span>
            <span>学习</span>
            <span>汉字</span>
            <span>麻烦你一下</span>
            <span>声调</span>
          </div>
          <div className="chinese-scroll-content">
            <span>你好</span>
            <span>谢谢</span>
            <span>不客气</span>
            <span>再见</span>
            <span>早上好</span>
            <span>这太让我失望了</span>
            <span>请问</span>
            <span>对不起</span>
            <span>没关系</span>
            <span>真的假的</span>
            <span>我很忙</span>
            <span>学习</span>
            <span>汉字</span>
            <span>麻烦你一下</span>
            <span>声调</span>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
