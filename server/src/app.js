const express = require("express");
const importRoutes = require("./routes/importRoutes");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.use("/api/imports", importRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

module.exports = app;
