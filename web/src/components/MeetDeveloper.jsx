import "./MeetDeveloper.css";

function MeetDeveloper() {
  return (
    <section className="meet-developer">
      <div className="meet-developer-container">
        <h2>Meet the developer.</h2>
        <div className="button-group">
          <a 
            href="https://www.sheldenr.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-filled"
          >
            View Portfolio
          </a>
          <a 
            href="https://linkedin.com/in/shelden-rattray" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-outlined"
          >
            View LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

export default MeetDeveloper;
