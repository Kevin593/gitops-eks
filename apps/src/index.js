const express = require("express");
const client = require("prom-client"); // librería para métricas Prometheus

const app = express();
const VERSION = "1.0.5";

/* ============================
   Prometheus metrics
============================ */

// Registro de métricas
const register = client.register;

// Métrica de contador para peticiones
const requestCounter = new client.Counter({
  name: "api_requests_total",
  help: "Total de peticiones a la API",
  labelNames: ["endpoint"]
});

// Métrica de histograma para tiempo de respuesta individual
const responseHistogram = new client.Histogram({
  name: "api_response_time_seconds",
  help: "Tiempo de respuesta de cada solicitud en segundos",
  labelNames: ["endpoint"],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10] // rangos para medir cada solicitud
});

/* ============================
   Middleware para métricas
============================ */
app.use((req, res, next) => {
  const end = responseHistogram.startTimer({ endpoint: req.path });
  requestCounter.inc({ endpoint: req.path }); // contar petición
  res.on("finish", () => {
    end(); // registrar tiempo de respuesta al terminar
  });
  next();
});

/* ============================
   Endpoints
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
