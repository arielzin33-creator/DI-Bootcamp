/**
 * Exercise (Set 3) 5: Managing DOM Elements with useRef and TypeScript
 *
 * This component demonstrates:
 * - useRef<HTMLInputElement | null>(null) — the ref starts as null until
 *   React attaches it to the rendered <input>, so the type must allow null.
 * - A useEffect that runs once on mount to focus the input, guarded with
 *   optional chaining since inputRef.current may still be null in theory.
 * - A click handler that re-focuses the same input imperatively.
 */

import { useEffect, useRef } from 'react';

function FocusableInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClick = (): void => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="card">
      <div className="form-field">
        <label htmlFor="focus-demo-input">Focused automatically on mount</label>
        <input
          id="focus-demo-input"
          ref={inputRef}
          type="text"
          placeholder="Click the button below to refocus"
        />
      </div>
      <div className="button-row">
        <button type="button" onClick={handleClick}>
          Focus input
        </button>
      </div>
    </div>
  );
}

export default FocusableInput;
