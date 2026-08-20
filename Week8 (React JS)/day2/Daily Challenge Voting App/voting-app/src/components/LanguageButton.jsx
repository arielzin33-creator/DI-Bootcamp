import React from "react";

function LanguageButton({ name, votes, onVote }) {
  return (
    <div className="language-card">
      <span className="language-card__name">{name}</span>
      <span className="language-card__votes">{votes}</span>
      <button className="language-card__button" onClick={onVote}>
        Vote
      </button>
    </div>
  );
}

export default LanguageButton;
