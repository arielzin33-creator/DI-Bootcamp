const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

// Needed to parse a JSON request body into req.body — without this,
// req.body would be undefined on the POST route below.
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello From Express" });
});

app.post("/api/world", (req, res) => {
  console.log(req.body);

  const { post } = req.body;
  res.json({
    message: `I received your POST request. This is what you sent me: ${post}`,
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
