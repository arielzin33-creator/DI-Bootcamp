// Simple functional component, driven entirely by props — satisfies the brief's
// "props (if required)" note. Calculator (the class component) owns all state.

function Button({ label, className, onClick }) {
  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}

export default Button;
