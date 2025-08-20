import React from "react";

export default function EngagementTable({ items }) {
  return (
    <table className="engagement-table">
      <thead>
        <tr>
          <th>Engagement ID</th>
          <th>Agent</th>
          <th>Queue</th>
          <th>Direction</th>
          <th>Duration</th>
          <th>Channel</th>
          <th>Recording</th>
        </tr>
      </thead>
      <tbody>
        {items.length ? items.map(e => (
          <tr key={e.engagementId}>
            <td>{e.engagementId}</td>
            <td>{e.agent || "-"}</td>
            <td>{e.queue || "-"}</td>
            <td>{e.direction || "-"}</td>
            <td>{e.duration || 0}s</td>
            <td>{e.channel || "-"}</td>
            <td>{e.s3Path ? <a href={e.s3Path.replace(/^.*uploads/, "/recordings")} download>Download</a> : "-"}</td>
          </tr>
        )) : (
          <tr><td colSpan="7" style={{textAlign:"center"}}>No data</td></tr>
        )}
      </tbody>
    </table>
  );
}
