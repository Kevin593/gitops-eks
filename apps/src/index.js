const express = require("express");
const client = require("prom-client");

const app = express();
const VERSION = "1.0.18888";

/* ============================
   Prometheus metrics
============================ */

// Registro por defecto
const register = client.register;

// Contador de peticiones HTTP
const requestCounter = new client.Counter({
  name: "api_requests_total",
  help: "Total de peticiones a la API",
  labelNames: ["endpoint"]
});

/* ============================
   Middleware de métricas
============================ */
app.use((req, res, next) => {
  requestCounter.inc({ endpoint: req.path });
  next();
});

/* ============================
   Endpoints
============================ */
app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

// Endpoint de métricas
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* ============================
   Server
============================ */
app.listen(3000, () => {
  console.log("API running on port 3000");
});
