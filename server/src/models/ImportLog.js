const mongoose = require("mongoose");

const ImportLogSchema = new mongoose.Schema({
  feedUrl: String,
  fileName: String,
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [
    {
      externalId: String,
      reason: String,
    },
  ],
});

module.exports = mongoose.model("ImportLog", ImportLogSchema);
