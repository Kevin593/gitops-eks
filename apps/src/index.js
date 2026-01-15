const express = require("express");
const app = express();

const VERSION = "4.0.0";

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

app.listen(3000, () => {
  console.log("App running on port 3000");
});
