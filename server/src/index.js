require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("✅ MongoDB connected");

    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err.message);
    console.error(err);
    process.exit(1);
  });

// cron job
require("./services/fetcher");
