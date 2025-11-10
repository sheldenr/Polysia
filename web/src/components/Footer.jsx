import primaryDark from '../assets/primary-dark.svg';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-left">
            <img src={primaryDark} alt="Polysia" className="footer-logo" />
          </div>


          <div className="footer-right">
            <a className="social" href="https://github.com/sheldenr/Polysia" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.8-.25.8-.56l-.01-2.02c-3.2.7-3.88-1.39-3.88-1.39-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.26 3.39.96.1-.76.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.58.24 2.75.12 3.04.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.42.36.79 1.07.79 2.16l-.01 3.2c0 .31.22.67.81.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/>
              </svg>
            </a>
            <a className="social" href="https://www.linkedin.com/company/109521171/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 0 0 5.001 2.5 2.5 0 0 0 0-5Zm.02 5.999H2V22h3V9.499ZM9 9.5H6v12.5h3V15.5c0-1.73.62-2.91 2.18-2.91 1.19 0 1.8.82 1.8 2.91V22h3v-6.98c0-3.74-2-5.49-4.67-5.49-2.16 0-3.11 1.19-3.64 2.02h-.07V9.5Z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Polysia · All rights reserved.</p>
          <p className="footer-tagline">Adaptive Mandarin learning for real progress.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
