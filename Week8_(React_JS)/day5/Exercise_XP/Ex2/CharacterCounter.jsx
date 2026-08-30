import React, { useRef } from "react";

/**
 * Character counter
 *
 * The text input is uncontrolled: instead of storing its value in
 * useState and re-rendering on every keystroke, we keep a ref to the
 * <input> DOM node and a ref to the <span> that displays the count.
 * On each "input" event we read inputRef.current.value.length and
 * write it directly into the counter span's textContent.
 *
 * This satisfies the exercise's requirement to track length via
 * useRef rather than useState.
 */
export default function CharacterCounter({ maxLength = 100 }) {
  const inputRef = useRef(null);
  const counterRef = useRef(null);

  const handleInput = () => {
    const length = inputRef.current.value.length;

    if (counterRef.current) {
      counterRef.current.textContent = `${length} / ${maxLength}`;
    }
  };

  return (
    <div style={styles.container}>
      <label htmlFor="counted-input" style={styles.label}>
        Type something
      </label>

      <input
        id="counted-input"
        ref={inputRef}
        onInput={handleInput}
        maxLength={maxLength}
        placeholder="Start typing..."
        style={styles.input}
      />

      <span ref={counterRef} style={styles.counter}>
        0 / {maxLength}
      </span>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    maxWidth: "320px",
    fontFamily: "sans-serif",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
  },
  input: {
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  counter: {
    fontSize: "12px",
    color: "#666",
    alignSelf: "flex-end",
  },
};
