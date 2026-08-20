import React, { useState } from "react";
import LanguageButton from "./components/LanguageButton";
import "./App.css";

function App() {
  const [languages, setLanguages] = useState([
    { name: "Php", votes: 0 },
    { name: "Python", votes: 0 },
    { name: "JavaScript", votes: 0 },
    { name: "Java", votes: 0 },
  ]);

  const handleVote = (index) => {
    setLanguages((prevLanguages) =>
      prevLanguages.map((language, i) =>
        i === index ? { ...language, votes: language.votes + 1 } : language
      )
    );
  };

  return (
    <div className="app">
      <h1 className="app__title">Vote for your favorite programming language</h1>
      <div className="app__list">
        {languages.map((language, index) => (
          <LanguageButton
            key={language.name}
            name={language.name}
            votes={language.votes}
            onVote={() => handleVote(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
