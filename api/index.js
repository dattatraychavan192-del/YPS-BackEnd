const mongoose = require("mongoose");
const { createApp } = require("../src/app");

const app = createApp();
let connectionPromise;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in the Vercel project settings.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
}

module.exports = async (req, res) => {
  const requestPath = req.url?.split("?")[0] || "";
  if (req.method === "OPTIONS" || !requestPath.startsWith("/api/students")) {
    return app(req, res);
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return res.status(503).json({
      error: { message: "Database is unavailable. Check MongoDB Atlas network access and credentials." },
    });
  }

  return app(req, res);
};
