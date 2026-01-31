const express = require("express");
const client = require("prom-client");

const app = express();
const VERSION = "1.0.3";

/* ============================
   Prometheus config
============================ */

// Registro de métricas
const register = client.register;

// Métricas por defecto (CPU, RAM, GC, event loop)
client.collectDefaultMetrics({ register });

/* ============================
   Métricas personalizadas
============================ */

// Total de peticiones HTTP
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total de peticiones HTTP recibidas",
  labelNames: ["method", "route", "status", "version"]
});

// Tiempo de respuesta
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de las peticiones HTTP en segundos",
  labelNames: ["method", "route", "status", "version"],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
});

/* ============================
   Middleware de monitoreo
============================ */

app.use((req, res, next) => {
  const ignoredRoutes = [
    "/metrics",
    "/.env",
    "/favicon.ico",
    "/robots.txt"
    // aquí puedes agregar más rutas que no quieras medir
  ];

  if (ignoredRoutes.includes(req.path)) return next();

  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const route = req.route?.path || req.path;

    // Contador de peticiones
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode,
      version: VERSION
    });

    // Latencia
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status: res.statusCode,
        version: VERSION
      },
      duration
    );
  });

  next();
});

/* ============================
   API
============================ */

// Endpoint principal de la API
app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

// Endpoint de métricas (Prometheus)
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
