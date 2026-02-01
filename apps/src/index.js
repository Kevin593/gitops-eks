const express = require("express");
const client = require("prom-client");

const app = express();
const VERSION = "1.0.5";

/* ============================
   Prometheus config
============================ */

// Registro de métricas
const register = client.register;

// Métricas por defecto: CPU y RAM
client.collectDefaultMetrics({ register, prefix: "myapi_" }); // prefijo opcional para diferenciar

/* ============================
   Métricas personalizadas
============================ */

// Contador de peticiones HTTP
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total de peticiones HTTP recibidas",
  labelNames: ["method", "route", "status", "version"]
});

// Tiempo que demora cada petición en segundos
const httpRequestDuration = new client.Gauge({
  name: "http_request_duration_seconds",
  help: "Tiempo que demora cada petición HTTP en segundos",
  labelNames: ["method", "route", "status", "version"]
});

/* ============================
   Middleware de monitoreo
============================ */

app.use((req, res, next) => {
  const ignoredRoutes = ["/metrics", "/favicon.ico"];

  if (ignoredRoutes.includes(req.path)) return next();

  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9; // segundos
    const route = req.route?.path || req.path;

    // Incrementa el contador de peticiones
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode,
      version: VERSION
    });

    // Guarda el tiempo de la última petición
    httpRequestDuration.set(
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
   Endpoints
============================ */

app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

// Endpoint de métricas para Prometheus
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
