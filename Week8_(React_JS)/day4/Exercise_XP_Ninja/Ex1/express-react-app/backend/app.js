const express = require("express");
const usersRouter = require("./routes/users");

const app = express();

app.use("/users", usersRouter);

module.exports = app;
