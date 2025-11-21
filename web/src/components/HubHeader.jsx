import "./HubHeader.css";

function HubHeader({
  title,
  subtitle,
  absolute = false,
  leftOffset = "0",
  width = "100%",
  height = 120,
  contentWidth = "var(--hub-width, 60%)",
  maxContentWidth = "var(--hub-max-width, 1100px)",
  minContentWidth = "var(--hub-min-width, 320px)",
  innerLayout = "column",
}) {
  const wrapperStyle = {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid rgba(19,20,19,0.1)",
    width,
    boxSizing: "border-box",
    ...(absolute
      ? { position: "absolute", top: 0, left: leftOffset, zIndex: 20, maxHeight: height,}
      : {}),
  };

  const innerStyle = {
    margin: "0 auto",
    boxSizing: "border-box",
    width: contentWidth,
    maxWidth: maxContentWidth,
    minWidth: minContentWidth,
    "--hub-header-direction": innerLayout,
    "--hub-header-align": innerLayout === "row" ? "center" : "flex-start",
  };

  return (
    <div className="hub-header-band" style={wrapperStyle}>
      <div className="hub-header-inner" style={innerStyle}>
        <h1 className="hub-header-title">{title}</h1>
        <p className="hub-header-sub">{subtitle}</p>
      </div>
    </div>
  );
}

export default HubHeader;
