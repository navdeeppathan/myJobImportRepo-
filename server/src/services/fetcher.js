// Simple cron-based fetcher: hits the feed URLs, converts XML->JSON, chunks items and pushes to queue
require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");
const { xmlToJson } = require("./xmlToJson");
const { jobQueue } = require("../queues/jobQueue");
const logger = require("../utils/logger");

const FEEDS = [
  "https://jobicy.com/?feed=job_feed",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

const BATCH_SIZE = Number(process.env.BATCH_SIZE || 50);

async function fetchAndEnqueue() {
  for (const feedUrl of FEEDS) {
    try {
      logger.info({ feedUrl }, "Fetching feed");
      const res = await axios.get(feedUrl, {
        responseType: "text",
        timeout: 20000,
      });
      const json = await xmlToJson(res.data);

      const items =
        (json.rss && json.rss.channel && json.rss.channel.item) ||
        (json.feed && json.feed.entry) ||
        [];
      const normalized = Array.isArray(items) ? items : [items];

      // split into batches
      for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
        const batch = normalized.slice(i, i + BATCH_SIZE);
        await jobQueue.add("import-batch", { feedUrl, items: batch });
      }

      logger.info({ feedUrl, total: normalized.length }, "Enqueued batches");
    } catch (err) {
      logger.error({ feedUrl, err: err.message }, "Failed to fetch feed");
    }
  }
}

//cron job
fetchAndEnqueue();
cron.schedule(process.env.FETCH_CRON || "0 * * * *", fetchAndEnqueue);

module.exports = { fetchAndEnqueue };
