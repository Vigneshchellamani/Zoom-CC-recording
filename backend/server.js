require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const engagementRoutes = require("./routes/engagementRoutes");
const configRoutes = require("./routes/configRoutes");
const zoomRoutes = require("./routes/zoomRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Serve recordings
app.use("/recordings", express.static(__dirname + "/uploads/recordings"));

app.use("/api/auth", authRoutes);
app.use("/api/engagements", engagementRoutes);
app.use("/api/config", configRoutes);
app.use("/api/zoom", zoomRoutes);
app.use("/webhook", webhookRoutes);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Backend listening on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  });
