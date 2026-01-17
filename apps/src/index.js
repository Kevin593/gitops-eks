const express = require("express");
const client = require("prom-client");

const app = express();
const VERSION = "1.0.31";

/* ============================
   Prometheus config
============================ */

// Registro de métricas
const register = client.register;

// Métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics();

// Endpoint para Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* ============================
   Endpoints de la app
============================ */

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

app.listen(3000, () => {
  console.log("App running on port 3000");
});