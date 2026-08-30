const express = require("express");
const router = express.Router();

// The one change from an express-generator scaffold's default
// users.js: the GET handler's placeholder response is replaced with
// the hardcoded array the exercise specifies.
router.get("/", (req, res) => {
  res.json([
    { id: 1, username: "somebody" },
    { id: 2, username: "somebody_else" },
  ]);
});

module.exports = router;
