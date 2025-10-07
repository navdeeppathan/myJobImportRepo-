require("dotenv").config();
const mongoose = require("mongoose");
const { Worker } = require("bullmq");
const { connection } = require("../queues/jobQueue");
const Job = require("../models/Job");
const ImportLog = require("../models/ImportLog");
const logger = require("../utils/logger");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Worker Mongo connected"));

const concurrency = Number(process.env.CONCURRENCY || 5);

const worker = new Worker(
  "job-import-queue",
  async (job) => {
    const { feedUrl, items } = job.data;
    logger.info({ feedUrl, count: items.length }, "Worker processing batch");

    const importLog = new ImportLog({
      feedUrl,
      fileName: feedUrl,
      totalFetched: items.length,
      totalImported: 0,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: [],
    });

    for (const item of items) {
      try {
        const externalId = item.guid || item.id || item.link || item.title;
        const payload = {
          externalId: String(externalId),
          title: item.title,
          description: item.description,
          company: item.company || item.author,
          location: item.location || item.region,
          url: item.link || item.url,
          raw: item,
        };

        const existing = await Job.findOne({ externalId: payload.externalId });
        if (existing) {
          Object.assign(existing, payload, { updatedAt: new Date() });
          await existing.save();
          importLog.updatedJobs++;
          importLog.totalImported++;
        } else {
          await Job.create(payload);
          importLog.newJobs++;
          importLog.totalImported++;
        }
      } catch (err) {
        logger.error(err, "Import error for item");
        importLog.failedJobs.push({
          externalId: item.guid || null,
          reason: err.message,
        });
      }
    }

    await importLog.save();
    return { ok: true };
  },
  { connection, concurrency }
);

worker.on("failed", (job, err) => {
  logger.error({ jobId: job.id, err: err.message }, "Job failed");
});

logger.info("Import worker started");
