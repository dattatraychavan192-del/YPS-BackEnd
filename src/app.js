const cors = require("cors");
const express = require("express");
const Student = require("./models/student");
const { errorHandler } = require("./middleware/error-handler");
const { createStudentsRouter } = require("./routes/students");

function createApp({ StudentModel = Student, clientOrigin = process.env.CLIENT_ORIGIN } = {}) {
  const app = express();
  const allowedOrigin = clientOrigin || "http://localhost:4200";

  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/students", createStudentsRouter(StudentModel));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
