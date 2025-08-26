import React from "react";
import "./RecordingModal.css";

export default function RecordingModal({ open, onClose, engagement }) {
  if (!open || !engagement) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Voice Recording</h3>
        <p>Engagement ID: {engagement.engagementId}</p>
        <p>
          {new Date(engagement.startTime).toLocaleString()} |{" "}
          {engagement.fileSize || "N/A"}
        </p>

        {/* 🎵 Audio Player */}
        <audio controls style={{ width: "100%", marginBottom: "10px" }}>
          <source
            src={`http://localhost:5000${engagement.publicUrl}`}
            type="audio/mp3"
          />
          Your browser does not support the audio element.
        </audio>

        {/* 📝 Transcript */}
        <div className="transcript">
          {engagement.transcript && engagement.transcript.length ? (
            engagement.transcript.map((line, idx) => (
              <div key={idx} className="transcript-line">
                <strong>{line.speaker}</strong> [{line.time}] : {line.text}
              </div>
            ))
          ) : (
            <p>No transcript available</p>
          )}
        </div>

        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    </div>
  );
}
