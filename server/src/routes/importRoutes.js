const express = require("express");
const ImportLog = require("../models/ImportLog");

const router = express.Router();

router.get("/", async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ImportLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
    ImportLog.countDocuments(),
  ]);

  res.json({ logs, page, limit, total });
});

module.exports = router;
