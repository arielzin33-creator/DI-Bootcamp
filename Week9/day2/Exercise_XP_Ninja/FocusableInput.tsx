import { useEffect, useRef } from 'react';

export default function FocusableInput() {
  /**
   * `HTMLInputElement | null`, not just `HTMLInputElement` — the ref is
   * `null` on the very first render, before React has attached it to the
   * actual `<input>` in the DOM (and would also be `null` again if the
   * input were ever conditionally unmounted). Every read of
   * `inputRef.current` has to account for that, which is exactly what the
   * `if (inputRef.current)` / `?.` checks below are doing — not extra
   * caution, but the type being honest about a real possibility.
   */
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="focusable-input">
      <input ref={inputRef} type="text" placeholder="Focused on mount" />
      <button type="button" onClick={handleClick}>
        Focus the input
      </button>
    </div>
  );
}
