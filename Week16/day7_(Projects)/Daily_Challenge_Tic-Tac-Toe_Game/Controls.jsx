// Mode toggle buttons + reset. Real <button> elements, not the reference demo's <a
// href="#">-style links — a link with no real destination is a misuse of the tag;
// a button is the semantically correct element for a click-triggered action with no
// navigation.

function Controls({ mode, onModeChange, onReset }) {
  return (
    <div className="controls">
      <button
        type="button"
        className={`controls__mode-btn ${mode === 'AI' ? 'controls__mode-btn--active' : ''}`}
        onClick={() => onModeChange('AI')}
      >
        Versus AI
      </button>
      <button
        type="button"
        className={`controls__mode-btn ${mode === '2P' ? 'controls__mode-btn--active' : ''}`}
        onClick={() => onModeChange('2P')}
      >
        2 Players
      </button>
      <button type="button" className="controls__reset-btn" onClick={onReset}>
        Reset board
      </button>
    </div>
  );
}

export default Controls;
