// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

// Routes
const authRoutes = require("./routes/authRoutes");
const engagementRoutes = require("./routes/engagementRoutes");
const configRoutes = require("./routes/configRoutes");
const zoomRoutes = require("./routes/zoomRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

// Models
const ZoomConfig = require("./models/ZoomConfig");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ✅ Dynamically serve recordings based on ZoomConfig
async function setupRecordingPath() {
  try {
    const cfg = await ZoomConfig.findOne();
    if (cfg?.downloadPath) {
      const basePath = cfg.downloadPath;
      const servePath = path.join(basePath, "recordings");

      if (fs.existsSync(servePath)) {
        console.log(`📂 Serving recordings from: ${servePath}`);
        app.use(
          "/recordings",
          express.static(servePath, {
            setHeaders: (res, filePath) => {
              if (filePath.endsWith(".mp3")) {
                res.set("Content-Type", "audio/mpeg");
              }
              if (filePath.endsWith(".wav")) {
                res.set("Content-Type", "audio/wav");
              }
            },
          })
        );
      } else {
        console.warn(`⚠️ Recordings folder not found: ${servePath}`);
      }
    } else {
      console.warn("⚠️ No ZoomConfig.downloadPath found in DB.");
    }``
  } catch (err) {
    console.error("❌ Error setting up recording path:", err.message);
  }
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/engagements", engagementRoutes);
app.use("/api/config", configRoutes);
app.use("/api/zoom", zoomRoutes);
app.use("/webhook", webhookRoutes);

const PORT = process.env.PORT || 5000;

// Connect DB and start server
connectDB(process.env.MONGO_URI)
  .then(async () => {
    await setupRecordingPath(); // ✅ setup recordings serving after DB is ready
    app.listen(PORT, () =>
      console.log(`🚀 Backend listening on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });
