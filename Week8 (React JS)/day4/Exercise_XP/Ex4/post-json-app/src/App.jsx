import React from "react";

// Replace this with the "Your unique URL" value from
// https://webhook.site — copy it fresh each time you open the site,
// since every visit generates a new unique URL. Remember to also
// toggle "Enable CORS" there, or the browser will block the request.
const WEBHOOK_URL = "https://webhook.site/REPLACE-WITH-YOUR-UNIQUE-ID";

const payload = {
  key1: "myusername",
  email: "mymail@gmail.com",
  name: "Isaac",
  lastname: "Doe",
  age: 27,
};

async function postData() {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // webhook.site echoes back a description of the request it just
  // received (its own request id, headers, etc.) as JSON.
  const data = await response.json();
  console.log(data);
}

function App() {
  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h1>Post JSON data</h1>
      <p>
        Sends the hardcoded payload below as a POST request, then logs
        the response to the console.
      </p>
      <pre style={styles.pre}>{JSON.stringify(payload, null, 2)}</pre>
      <button onClick={postData} style={styles.button}>
        Send data
      </button>
    </div>
  );
}

const styles = {
  pre: {
    backgroundColor: "#f5f5f5",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    maxWidth: "320px",
  },
  button: {
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #1e1e1e",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    cursor: "pointer",
  },
};

export default App;
