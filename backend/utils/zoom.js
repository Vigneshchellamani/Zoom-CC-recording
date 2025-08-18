const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Engagement = require("../models/Engagement");
const ZoomConfig = require("../models/ZoomConfig");
const { decrypt } = require("./crypto");

/**
 * Resolve access token using per-company encrypted config if present.
 * Falls back to process.env if no company config stored.
 */
async function getAccessToken(companyId = null) {
  let clientId = process.env.ZOOM_CLIENT_ID || "";
  let clientSecret = process.env.ZOOM_CLIENT_SECRET || "";
  let accountId = process.env.ZOOM_ACCOUNT_ID || "";

  if (companyId) {
    const cfg = await ZoomConfig.findOne({ companyId });
    if (cfg) {
      clientId = decrypt(cfg.clientIdEnc);
      clientSecret = decrypt(cfg.clientSecretEnc);
      accountId = decrypt(cfg.accountIdEnc);
    }
  }

  const res = await axios.post("https://zoom.us/oauth/token", null, {
    params: { grant_type: "account_credentials", account_id: accountId },
    auth: { username: clientId, password: clientSecret }
  });

  return res.data.access_token;
}

/**
 * Query Zoom API for recordings of an engagement
 * Returns first recording (or throws).
 */
async function getRecording(accessToken, engagementId) {
  const url = `https://api.zoom.us/v2/contact_center/engagements/${engagementId}/recordings`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const rec = res.data.recordings?.[0];
  if (!rec) throw new Error("No recording found");

  const downloadUrl = rec.download_url;
  // Prefer extension from API (if exposed), fallback to mp3
  const ext = rec.file_extension ? `.${rec.file_extension}` : ".mp3";
  const fileName = `${engagementId}${ext}`;

  // Use start time if available from object else now
  const startTime = res.data.start_time ? new Date(res.data.start_time) :
                    rec.start_time ? new Date(rec.start_time) : new Date();

  return { downloadUrl, fileName, startTime, meta: res.data, recording: rec };
}

async function streamDownload(downloadUrl, accessToken, absPath) {
  await fs.promises.mkdir(path.dirname(absPath), { recursive: true });

  const writer = fs.createWriteStream(absPath);
  const res = await axios.get(downloadUrl, {
    responseType: "stream",
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on("finish", () => resolve(absPath));
    writer.on("error", reject);
  });
}

/**
 * Core handler. companyId is optional — if you can map from payload, pass it.
 */
async function handleEngagementEnded(engagementId, companyId = "default") {
  console.log(`⚙️ Handling engagement ${engagementId} (company: ${companyId})`);
  const token = await getAccessToken(companyId);
  const { downloadUrl, fileName, startTime, recording } = await getRecording(token, engagementId);

  const dir = path.join(
    __dirname, "..", "uploads", "recordings",
    String(startTime.getFullYear()),
    String(startTime.getMonth() + 1).padStart(2, "0"),
    String(startTime.getDate()).padStart(2, "0")
  );

  const absPath = path.join(dir, fileName);
  await streamDownload(downloadUrl, token, absPath);

  // Save metadata (extend as needed)
  await Engagement.findOneAndUpdate(
    { engagementId },
    {
      companyId,
      engagementId,
      direction: recording.direction || "",
      startTime,
      duration: recording.duration || 0,
      agent: recording.agent_name || "",
      queue: recording.queue_name || "",
      channel: recording.channel || "",
      flow: recording.flow_name || "",
      disposition: recording.disposition || "",
      notes: "",
      transcript: "",
      recordingUrl: downloadUrl,
      s3Path: absPath
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Saved engagement ${engagementId} to ${absPath}`);
}

module.exports = { handleEngagementEnded };
