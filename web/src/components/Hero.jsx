import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-row">
            <span className="start-learning">
              <span className="square-bullet" aria-hidden="true"></span> Start your journey now
            </span>
          </div>

          <div className="hero-row">
            <h1 className="hero-title">
              The only adaptive system built for conversational language learning.
            </h1>
          </div>

          <div className="hero-row">
            <p className="hero-description">
              Built around your goals, from casual conversation to professional communication, with lessons that adapt to your pace and progress. Currently built around learning Mandarin Chinese.
            </p>
          </div>

          <div className="hero-row">
            <Link className="action-button">
              Request a Demo
              <span className="arrow">→</span>
            </Link>
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
