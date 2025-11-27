import "./LearningHub.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import favicon from "../assets/favicon.svg";
import HubHeader from "../components/HubHeader";

function NavIcon({ name }) {
  switch (name) {
    case "Dashboard":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M8 17v-5.5M12 17V8.5M16 17v-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M7.5 11.8 12 8.8l4.5 3.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "Recall":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7a2 2 0 0 1 2-2h6.5A2.5 2.5 0 0 1 15 7.5V19c0-1.4-1.1-2.5-2.5-2.5H6a2 2 0 0 1-2-2V7Z" fill="currentColor"/>
          <path d="M9 9h7.5A1.5 1.5 0 0 1 18 10.5V19c0-1-0.8-1.8-1.8-1.8H9" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
      );
    case "Settings":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" fill="none" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M20 12a8 8 0 0 0-.1-1l2-1.3-2-3.4-2.3.9a8 8 0 0 0-1.7-1l-.2-2.4h-4l-.2 2.4a8 8 0 0 0-1.7 1l-2.3-.9-2 3.4 2 1.3a8 8 0 0 0 0 2.1l-2 1.3 2 3.4 2.3-.9a8 8 0 0 0 1.7 1l.2 2.4h4l.2-2.4a8 8 0 0 0 1.7-1l2.3.9 2-3.4-2-1.3c.07-.33.1-.66.1-1Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      );
    case "Reading":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H11v14H6.5A2.5 2.5 0 0 0 4 20.5V6.5Z" fill="none" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M20 6.5A2.5 2.5 0 0 0 17.5 4H13v14h4.5A2.5 2.5 0 0 1 20 20.5V6.5Z" fill="none" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M7.5 8.5H10M14 8.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case "Chat Mode":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H10l-4 3v-3H6.5A2.5 2.5 0 0 1 4 12.5v-6Z" fill="none" stroke="currentColor" strokeWidth="1.6"/>
          <circle cx="9" cy="10" r="0.8" fill="currentColor"/>
          <circle cx="12" cy="10" r="0.8" fill="currentColor"/>
          <circle cx="15" cy="10" r="0.8" fill="currentColor"/>
        </svg>
      );
    case "Grammar Lab":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h10M9 3v7l-4 7a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-4-7V3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      );
    case "Listening Focus":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 14a6 6 0 0 1 12 0v3a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M6 14v3a2 2 0 0 0 2 2h1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M3 12c1.5-3 4.5-5 9-5s7.5 2 9 5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        </svg>
      );
    case "Logout":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 5H7.5A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19H10" fill="none" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M14 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 12h7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}

function Dashboard() {
  const [active, setActive] = useState("Dashboard");

  const items = [
    { key: "Chat Mode" },
    { key: "Reading" },
    { key: "Recall" },
  ];
  const utilItems = [{ key: "Dashboard" }, { key: "Settings" }];

  return (
    <section className="learning-hub-page">
      <div className="learning-hub-shell">
        <aside className="learning-hub-sidebar">
          <div className="learning-hub-sidebar-top">
            <Link to="/">
              <img src={favicon} alt="Polysia" className="learning-hub-sidebar-logo" />
            </Link>
            <div className="learning-hub-sidebar-brand">Polysia</div>
          </div>
          <nav className="learning-hub-sidebar-nav">
            {items.map((item) => (
              <button
                key={item.key}
                className={`learning-hub-nav-item ${active === item.key ? "active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                <span className="learning-hub-nav-icon" aria-hidden>
                  <NavIcon name={item.key} />
                </span>
                <span className="learning-hub-nav-label">{item.key}</span>
              </button>
            ))}
          </nav>
          <div className="learning-hub-sidebar-utils">
            {utilItems.map((item) => (
              <button
                key={item.key}
                className={`learning-hub-nav-item ${active === item.key ? "active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                <span className="learning-hub-nav-icon" aria-hidden>
                  <NavIcon name={item.key} />
                </span>
                <span className="learning-hub-nav-label">{item.key}</span>
              </button>
            ))}
            <button
              className="learning-hub-logout-mini"
              onClick={() => setActive("Logout")}
              aria-label="Logout"
              title="Logout"
            >
              <NavIcon name="Logout" />
            </button>
          </div>
        </aside>

        <main className="learning-hub-content">
          {active === "Chat Mode" ? (
            <ChatModeContent />
          ) : active === "Reading" ? (
            <ReadingModeContent />
          ) : active === "Recall" ? (
            <RecallModeContent />
          ) : active === "Dashboard" ? (
            <DashboardContent setActive={setActive} />
          ) : (
            <PlaceholderMode title={active} />
          )}
        </main>
      </div>
    </section>
  );
}

function PlaceholderMode({ title }) {
  return (
    <div className="hub-mode-container">
      <HubHeader title={title} subtitle="Content coming soon." absolute height={120} width="100%" leftOffset="0" />
      <div className="hub-mode-width">
        <div className="placeholder-box">
          <p>We’re rebuilding this mode. Sidebar remains for navigation.</p>
        </div>
      </div>
    </div>
  );
}

function ChatModeContent() {
  const registers = ["Formal", "Casual"];
  const scenarios = [
    "School classmates",
    "Taxi and rider",
    "Shopper and attendant",
    "Business meeting",
    "Ordering food",
  ];
  const [register, setRegister] = useState(registers[0]);
  const [scenario, setScenario] = useState(scenarios[0]);

  const messages = [
    { role: "assistant", text: "你好！今天想聊什么？" },
    { role: "user", text: "我想练习在出租车上跟司机说话。" },
    { role: "assistant", text: "好的，我们来模拟一下出租车的对话。" },
  ];

  const renderChars = (text) =>
    text.split("").map((char, idx) => {
      if (char.trim() === "") return <span key={`space-${idx}`} className="char-space"></span>;
      return (
        <span className="char-wrapper" key={`${char}-${idx}`}>
          <span className="char-box">{char}</span>
          <span className="char-tooltip">pinyin</span>
        </span>
      );
    });

  return (
    <div className="hub-mode-container">
      <HubHeader
        title="Chat Mode"
        subtitle="Practice real conversation in Mandarin with adaptive feedback."
        absolute
        height={120}
        width="100%"
        leftOffset="0"
      />
      <div className="hub-mode-width chat-mode-layout">
        <div className="chat-mode-left">
          <div className="chat-section">
            <div className="chat-section-title">Register</div>
            <div className="option-stack">
              {registers.map((item) => (
                <button
                  key={item}
                  className={`option-pill ${register === item ? "active" : ""}`}
                  onClick={() => setRegister(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-section">
            <div className="chat-section-title">Scenario</div>
            <div className="option-stack">
              {scenarios.map((item) => (
                <button
                  key={item}
                  className={`option-pill ${scenario === item ? "active" : ""}`}
                  onClick={() => setScenario(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="chat-mode-right">
          <div className="chat-window">
            <div className="chat-window-meta">
              <span>Style: {register}</span>
              <span>Scenario: {scenario}</span>
            </div>
            <div className="chat-window-body">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`chat-bubble ${m.role === "assistant" ? "chat-assistant" : "chat-user"}`}
                >
                  {m.role === "assistant" ? renderChars(m.text) : m.text}
                </div>
              ))}
            </div>
            <div className="chat-window-input">
              <input className="chat-input" placeholder="Type a message..." />
              <button className="chat-send-btn">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadingModeContent() {
  const headerHeight = 120;
  const readingText =
    "阅读练习：请滑过每个汉字查看拼音提示。春天的校园里，樱花飘落在石板路上，学生们正匆匆赶往图书馆；" +
    "远处的钟声回荡，提醒大家午休即将结束。\n" +
    "地铁站里，一位乘客轻声问路：“请问去美术馆是哪一站下车？”工作人员耐心回答，并递上一张简易路线图。\n" +
    "车厢广播提示下一站是‘文化广场’，窗外的高楼在阳光下闪烁。热腾腾的包子香从街口飘来，老人正悠闲地下棋，" +
    "孩子们追逐风筝，笑声此起彼伏。\n" +
    "今晚的任务：找出时间、地点、人物、事件这四类关键词，并用一句话总结内容。";

  const highlightWords = ["樱花飘落", "图书馆", "地铁站", "美术馆", "下一站", "文化广场", "包子香"];

  const renderChars = (text) => {
    const nodes = [];
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      if (char === "\n") {
        nodes.push(<br key={`br-${i}`} />);
        i += 1;
        continue;
      }
      if (char.trim() === "") {
        nodes.push(<span key={`space-${i}`} className="char-space"></span>);
        i += 1;
        continue;
      }
      const match = highlightWords.find((word) => text.startsWith(word, i));
      if (match) {
        match.split("").forEach((c, offset) => {
          const idx = i + offset;
          nodes.push(
            <span className="char-wrapper" key={`${c}-hi-${idx}`}>
              <span className="char-box reading-highlight">{c}</span>
              <span className="char-tooltip">pinyin</span>
            </span>
          );
        });
        i += match.length;
        continue;
      }
      nodes.push(
        <span className="char-wrapper" key={`${char}-${i}`}>
          <span className="char-box">{char}</span>
          <span className="char-tooltip">pinyin</span>
        </span>
      );
      i += 1;
    }
    return nodes;
  };

  return (
    <div className="hub-mode-container">
      <HubHeader
        title="Reading"
        subtitle="Practice real conversation in Mandarin with adaptive feedback."
        absolute
        height={headerHeight}
        width="100%"
        leftOffset="0"
      />
      <div className="hub-mode-width">
        <div className="reading-standalone">
          <div className="reading-title">Reading Practice</div>
          <div className="reading-body">
            {renderChars(readingText)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecallModeContent() {
  const headerHeight = 120;
  const [repeatSpeed, setRepeatSpeed] = useState("Normal");
  const [testPronunciation, setTestPronunciation] = useState("On");
  const cards = [
    { hanzi: "词", pinyin: "cí", meaning: "word / term" },
    { hanzi: "书", pinyin: "shū", meaning: "book" },
    { hanzi: "学", pinyin: "xué", meaning: "to study" },
  ];
  const current = cards[0];
  return (
    <div className="hub-mode-container">
      <HubHeader
        title="Recall"
        subtitle="Flash through characters and track what you know."
        absolute
        height={headerHeight}
        width="100%"
        leftOffset="0"
      />
      <div className="hub-mode-width recall-layout">
        <div className="chat-mode-left">
          <div className="chat-section">
            <div className="chat-section-title">Repeat Speed</div>
            <div className="option-stack">
              {["Normal", "Slow"].map((item) => (
                <button
                  key={item}
                  className={`option-pill ${repeatSpeed === item ? "active" : ""}`}
                  onClick={() => setRepeatSpeed(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="chat-section">
            <div className="chat-section-title">Test Pronunciation</div>
            <div className="option-stack">
              {["On", "Off"].map((item) => (
                <button
                  key={item}
                  className={`option-pill ${testPronunciation === item ? "active" : ""}`}
                  onClick={() => setTestPronunciation(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="recall-card">
          <div className="recall-hanzi">{current.hanzi}</div>
          <div className="recall-detail">
            {current.pinyin} · {current.meaning}
          </div>
          <div className="recall-actions">
            <button className="recall-btn recall-btn-known">I know this</button>
            <button className="recall-btn recall-btn-unknown">Don’t know</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ setActive }) {
  const headerHeight = 120;
  const weeklyData = [
    { day: "Mon", minutes: 15, bar: 65 },
    { day: "Tue", minutes: 22, bar: 88 },
    { day: "Wed", minutes: 8, bar: 32 },
    { day: "Thu", minutes: 12, bar: 48 },
    { day: "Fri", minutes: 0, bar: 5 },
    { day: "Sat", minutes: 34, bar: 100 },
    { day: "Sun", minutes: 18, bar: 70 },
  ];

  return (
    <div className="hub-mode-container">
      <HubHeader
        title="Dashboard"
        subtitle="Quick snapshot of your study momentum."
        absolute
        height={headerHeight}
        width="100%"
        leftOffset="0"
        innerLayout="row"
      />
      <div className="hub-mode-width dashboard-grid">
        <div className="dash-hero">
          <div className="dash-hero-top">
            <div className="dash-hello">Hello, Shelden</div>
          </div>
          <div className="dash-subline">You have studied for 2.3 hours today.</div>
          <div className="dash-hero-stats">
            <div className="dash-streak-group">
              <span className="dash-stat dash-streak">
                <svg className="streak-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
                  <g transform="translate(0,2.4)">
                    <path d="M12 3s-4 4-4 7a4 4 0 0 0 8 0c0-3-4-7-4-7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.2 12.2C9.6 13.6 10.7 14.5 12 14.5c1.3 0 2.4-.9 2.8-2.3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                </svg>
                Streak: 5 days
              </span>
              <span className="dash-divider" aria-hidden="true"></span>
            </div>
            <span className="dash-stat dash-today">Today: 18 / 30 min</span>
          </div>
        </div>

        <div className="dash-highlight">
          <div className="dash-highlight-title">Most used mode this week</div>
          <div className="dash-highlight-body">Recall · 54 minutes</div>
        </div>

        <div className="dash-row">
          <div className="dash-box">
            <div className="dash-box-title">Weekly study times</div>
            <div className="dash-weekly-list">
              {weeklyData.map((item) => (
                <div className="dash-weekly-row" key={item.day}>
                  <span className="dash-weekly-day">{item.day}</span>
                  <div className="dash-weekly-bar">
                    <div className="dash-weekly-fill" style={{ width: `${item.bar}%` }}></div>
                  </div>
                  <span className="dash-weekly-min">{item.minutes} min</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dash-box dash-box-reco">
            <button
              type="button"
              className="dash-reco-button"
              onClick={() => typeof setActive === "function" && setActive("Chat Mode")}
              aria-label="Open Chat Mode"
            >
              <div className="reco-icon" aria-hidden>
                <NavIcon name="Chat Mode" />
              </div>
              <div className="reco-body">
                <div className="reco-label">Chat Mode</div>
                <div className="reco-desc">Recommended based on your recent activity, try a short conversation to reinforce progress. →</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
