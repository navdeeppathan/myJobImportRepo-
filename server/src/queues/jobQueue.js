const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const jobQueue = new Queue("job-import-queue", { connection });

module.exports = { jobQueue, connection };
