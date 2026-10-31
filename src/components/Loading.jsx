// Three ruled lines that fill in one after another, like notes being written.
// Colours come from the app tokens (see .s-loader in study.css); the old
// primaryColor/secondaryColor props some callers pass are no longer needed.
const WaveLoader = ({ size = "7em" }) => {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="s-loader" style={{ width: size }}>
        <span className="s-loader-line" />
        <span className="s-loader-line" />
        <span className="s-loader-line" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
};

export default WaveLoader;
