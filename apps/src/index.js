const express = require("express");
const app = express();

const VERSION = "1.0.76";

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

app.listen(3000, () => {
  console.log("App running on port 3000");
});
