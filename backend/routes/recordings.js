// routes/recordings.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const { decryptDecompressRead } = require("../utils/zoom"); // helper function

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const download = req.query.download === "1";

    const basePath = path.join(process.cwd(), "recordings", "engagements");
    const encPath = path.join(basePath, `${id}.mp3.gz.enc`);

    if (!fs.existsSync(encPath)) {
      return res.status(404).send("Recording not found");
    }

    // 🔑 decrypt + gunzip into stream
    const stream = await decryptDecompressRead(encPath);

    if (download) {
      res.setHeader("Content-Disposition", `attachment; filename="${id}.mp3"`);
    }
    res.setHeader("Content-Type", "audio/mpeg");

    stream.pipe(res);
  } catch (err) {
    console.error("❌ Recording stream error:", err);
    res.status(500).send("Failed to process recording");
  }
});

module.exports = router;
