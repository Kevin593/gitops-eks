const express = require("express");

const app = express();
const VERSION = "1.0.9"; // aquí puedes cambiar la versión fácilmente

/* ============================
   API
============================ */

// Endpoint principal de la API
app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

/* ============================
   Server
============================ */

app.listen(3000, () => {
  console.log("API running on port 3000");
});
