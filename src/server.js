require("dotenv").config();

const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { createApp } = require("./app");

const port = Number(process.env.PORT || 3000);

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is required. Add your MongoDB Atlas connection string to .env.",
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const app = createApp();

  app.listen(port, () => {
    console.log(`YPS Academy Student API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start YPS Academy Student API:");
  console.error(error.stack || error);
  process.exit(1);
});
