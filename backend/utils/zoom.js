const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Engagement = require("../models/Engagement");
const ZoomConfig = require("../models/ZoomConfig");
const { decrypt } = require("./crypto");

let cachedConfig = null;

async function loadZoomConfig() {
  if (cachedConfig) return cachedConfig;

  const cfg = await ZoomConfig.findOne();
  if (!cfg) throw new Error("⚠️ No Zoom configuration found.");

  cachedConfig = {
    clientId: decrypt(cfg.clientIdEnc),
    clientSecret: decrypt(cfg.clientSecretEnc),
    accountId: decrypt(cfg.accountIdEnc),
  };
  return cachedConfig;
}

async function getAccessToken() {
  const { clientId, clientSecret, accountId } = await loadZoomConfig();

  const res = await axios.post("https://zoom.us/oauth/token", null, {
    params: { grant_type: "account_credentials", account_id: accountId },
    auth: { username: clientId, password: clientSecret },
  });

  return res.data.access_token;
}

async function getRecording(accessToken, engagementId) {
  const url = `https://api.zoom.us/v2/contact_center/engagements/${engagementId}/recordings`;

  console.log(`📡 Fetching recording: ${url}`);

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  
  const rec = res.data.recordings?.find(r => r.channel === "voice");
  if (!rec) throw new Error("No recording found for engagement " + engagementId);

  const downloadUrl = rec.download_url;
  const ext = rec.file_extension ? `.${rec.file_extension}` : ".mp3";
  const fileName = `${engagementId}${ext}`;

  const startTime = res.data.start_time ? new Date(res.data.start_time) : new Date();

  return { downloadUrl, fileName, startTime, meta: res.data, recording: rec };
}

async function streamDownload(downloadUrl, accessToken, absPath) {
  await fs.promises.mkdir(path.dirname(absPath), { recursive: true });

  console.log(`⬇️ Downloading recording to ${absPath}`);

  const writer = fs.createWriteStream(absPath);
  const res = await axios.get(downloadUrl, {
    responseType: "stream",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on("finish", () => {
      console.log("✅ Download complete:", absPath);
      resolve(absPath);
    });
    writer.on("error", reject);
  });
}

async function handleEngagementEnded(engagementId) {
  console.log(`⚙️ Handling engagement ${engagementId}`);

  const token = await getAccessToken();
  const { downloadUrl, fileName, startTime, recording } = await getRecording(token, engagementId);

  const dir = path.join(
    __dirname,
    "..",
    "uploads",
    "recordings",
    String(startTime.getFullYear()),
    String(startTime.getMonth() + 1).padStart(2, "0"),
    String(startTime.getDate()).padStart(2, "0")
  );

  const absPath = path.join(dir, fileName);
  
   // Public URL for frontend
  const publicUrl = `/recordings/${startTime.getFullYear()}/${String(
    startTime.getMonth() + 1
  ).padStart(2, "0")}/${String(startTime.getDate()).padStart(2, "0")}/${fileName}`;


  await streamDownload(downloadUrl, token, absPath);

 

 await Engagement.findOneAndUpdate(
  { engagementId },
  {
    engagementId,
    startTime,
    duration: recording.duration || engagementData.duration || 0,

    consumer: engagementData.consumers?.[0]?.consumer_display_name || "",
    agent: engagementData.agents?.map(a => a.display_name).join(", ") || "",
    queue: engagementData.queues?.[0]?.queue_name || "",
    flow: engagementData.flows?.[0]?.flow_name || "",
    disposition: Array.isArray(engagementData.dispositions)
      ? engagementData.dispositions[0]?.name || ""
      : engagementData.disposition || "",

    notes: Array.isArray(engagementData.notes)
      ? engagementData.notes.map(note => note.content || "").join(" | ")
      : "",

    channel: recording.channel || engagementData.channel || "",
    recordingUrl: downloadUrl,
    localPath: absPath,
    publicUrl,
    direction: engagementData.direction || "",
    source: engagementData.source || "",
    waitingDuration: engagementData.waiting_duration || 0,
    handlingDuration: engagementData.handling_duration || 0,
    wrapUpDuration: engagementData.wrap_up_duration || 0,
    transcript: engagementData.transcript_url || "",
    voicemail: engagementData.voice_mail ? true : false,
    recordingConsent: engagementData.recording_consent || false,
  },
  { upsert: true, new: true }
);


  console.log(`✅ Saved full engagement info for ${engagementId} at ${absPath}`);
}

module.exports = { handleEngagementEnded, loadZoomConfig };
