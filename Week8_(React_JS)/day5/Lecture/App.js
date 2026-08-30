// App.js
import React from "react";
import MyContext from "./MyContext";

function App() {
  const sharedState = {
    data: "This is shared data",
  };

  return (
    <MyContext.Provider value={sharedState}>
      {/* Your component tree goes here */}
    </MyContext.Provider>
  );
}

export default App;