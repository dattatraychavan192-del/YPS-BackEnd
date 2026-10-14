const cors = require("cors");
const express = require("express");
const Student = require("./models/student");
const { errorHandler } = require("./middleware/error-handler");
const { createStudentsRouter } = require("./routes/students");

function createApp({
  StudentModel = Student,
  clientOrigin = process.env.CLIENT_ORIGIN,
} = {}) {
  const app = express();
  const allowedOrigins = new Set([
    "http://localhost:4200",
    "https://yps-reactive-form2.vercel.app",
  ]);
  if (clientOrigin) {
    allowedOrigins.add(clientOrigin.replace(/\/+$/, ""));
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, !origin || allowedOrigins.has(origin));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/students", createStudentsRouter(StudentModel));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
