const express = require("express");
const client = require("prom-client");

const app = express();
const VERSION = "1.0.7";

/* ============================
   Prometheus metrics
============================ */

// Registro de métricas
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // CPU, memoria, GC, etc.

// Contador de peticiones por endpoint
const requestCounter = new client.Counter({
  name: "api_requests_total",
  help: "Total de peticiones a la API",
  labelNames: ["endpoint"]
});

// Histograma de tiempo de respuesta por endpoint
const responseHistogram = new client.Histogram({
  name: "api_response_time_seconds",
  help: "Tiempo de respuesta de cada solicitud en segundos",
  labelNames: ["endpoint"],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10]
});

// Registrar métricas en el registry
register.registerMetric(requestCounter);
register.registerMetric(responseHistogram);

/* ============================
   Middleware para métricas
============================ */
app.use((req, res, next) => {
  const end = responseHistogram.startTimer({ endpoint: req.path });
  requestCounter.inc({ endpoint: req.path });
  res.on("finish", () => {
    end();
  });
  next();
});

/* ============================
   Endpoints de la API
============================ */
app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

// Endpoint para Prometheus
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
