import React, { useState } from "react";
import "./EngagementTable.css";

export default function EngagementTable({ items }) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [queue, setQueue] = useState("");
  const [channel, setChannel] = useState("");
  const [direction, setDirection] = useState("");
  const [agent, setAgent] = useState("");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // column visibility state
  const allColumns = [
    "Engagement ID",
    "Direction",
    "Consumer",
    "Channel",
    "Agent",
    "Queue",
    "Flow",
    "Duration",
    "Recording",
    "Start Time",
    "Transfer_type",
    "Upgraded_to_channel_type",
    "Accept_type",
  ];

  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const [openSettings, setOpenSettings] = useState(false);

  const toggleColumn = (col) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00:00";
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Apply filters
  const filteredItems = items.filter((e) => {
    const matchesSearch =
      e.engagementId?.toLowerCase().includes(search.toLowerCase()) ||
      e.agent?.toLowerCase().includes(search.toLowerCase()) ||
      e.queue?.toLowerCase().includes(search.toLowerCase());

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const engagementTime = e.startTime ? new Date(e.startTime) : null;

    const matchesDate =
      (!start || (engagementTime && engagementTime >= start)) &&
      (!end || (engagementTime && engagementTime <= end));

    const matchesQueue = !queue || e.queue === queue;
    const matchesChannel = !channel || e.channel === channel;
    const matchesDirection = !direction || e.direction === direction;
    const matchesAgent = !agent || e.agent === agent;

    return (
      matchesSearch &&
      matchesDate &&
      matchesQueue &&
      matchesChannel &&
      matchesDirection &&
      matchesAgent
    );
  });

  // pagination logic
  const totalResults = filteredItems.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setQueue("");
    setChannel("");
    setDirection("");
    setAgent("");
  };

  return (
    <div className="engagement-table-wrapper">
      {/* 🔎 Filter Controls */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search Engagement ID, Agent, Queue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <select value={queue} onChange={(e) => setQueue(e.target.value)}>
          <option value="">Queue (All)</option>
          {[...new Set(items.map((i) => i.queue))].map(
            (q) => q && <option key={q}>{q}</option>
          )}
        </select>

        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="">Channel / Source (All)</option>
          {[...new Set(items.map((i) => i.channel))].map(
            (c) => c && <option key={c}>{c}</option>
          )}
        </select>

        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        >
          <option value="">Direction (All)</option>
          {[...new Set(items.map((i) => i.direction))].map(
            (d) => d && <option key={d}>{d}</option>
          )}
        </select>

        <button className="filter-btn" onClick={clearFilters}>
          Clear All
        </button>

        {/* ⚙️ Settings Icon */}
        <div className="settings-wrapper">
          <button
            className="settings-btn"
            onClick={() => setOpenSettings(!openSettings)}
          >
            <img src="/gear.png" alt="settings" width={20} height={20} />
          </button>
          {openSettings && (
            <div className="settings-dropdown">
              {allColumns.map((col) => (
                <label key={col} className="settings-option">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                  />
                  {col}
                </label>
              ))}
              <button
                onClick={() => setOpenSettings(false)}
                className="settings-confirm"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📊 Engagement Table */}
      <div className="engagement-table-container">
        <table className="engagement-table">
          <thead>
            <tr>
              {visibleColumns.includes("Engagement ID") && (
                <th>Engagement ID</th>
              )}
              {visibleColumns.includes("Direction") && <th>Direction</th>}
              {visibleColumns.includes("Consumer") && <th>Consumer</th>}
              {visibleColumns.includes("Channel") && <th>Channel</th>}
              {visibleColumns.includes("Agent") && <th>Agent</th>}
              {visibleColumns.includes("Queue") && <th>Queue</th>}
              {visibleColumns.includes("Flow") && <th>Flow</th>}
              {visibleColumns.includes("Duration") && <th>Duration</th>}
              {visibleColumns.includes("Recording") && <th>Recording</th>}
              {visibleColumns.includes("Start Time") && <th>Start Time</th>}
              {visibleColumns.includes("Transfer_type") && (
                <th>Transfer_type</th>
              )}
              {visibleColumns.includes("Upgraded_to_channel_type") && (
                <th>Upgraded_to_channel_type</th>
              )}
              {visibleColumns.includes("Accept_type") && <th>Accept_type</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length ? (
              paginatedItems.map((e) => (
                <tr key={e.engagementId}>
                  {visibleColumns.includes("Engagement ID") && (
                    <td>
                      <span className="link">{e.engagementId}</span>
                    </td>
                  )}
                  {visibleColumns.includes("Direction") && (
                    <td>{e.direction || "-"}</td>
                  )}
                  {visibleColumns.includes("Consumer") && (
                    <td>{e.consumer || "-"}</td>
                  )}
                  {visibleColumns.includes("Channel") && (
                    <td>{e.channel || "-"}</td>
                  )}
                  {visibleColumns.includes("Agent") && (
                    <td>{e.agent || "-"}</td>
                  )}
                  {visibleColumns.includes("Queue") && (
                    <td>{e.queue || "-"}</td>
                  )}
                  {visibleColumns.includes("Flow") && <td>{e.flow || "-"}</td>}
                  {visibleColumns.includes("Duration") && (
                    <td>{formatDuration(e.duration)}</td>
                  )}
                  {visibleColumns.includes("Recording") && (
                    <td>
                      {e.publicUrl ? (
                        <audio controls className="audio-player">
                          <source
                            src={`http://localhost:5000${e.publicUrl}`}
                            type="audio/mp3"
                          />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <span className="no-recording">No Recording</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes("Start Time") && (
                    <td>{formatDate(e.startTime)}</td>
                  )}
                  {visibleColumns.includes("Accept_type") && (
                    <td>{e.accept_type || "-"}</td>
                  )}
                  {visibleColumns.includes("Transfer_type:") && (
                    <td>{e.transfer_type || "-"}</td>
                  )}
                  {visibleColumns.includes("Upgraded_to_channel_type") && (
                    <td>{e.upgraded_to_channel_type || "-"}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📌 Pagination Footer */}
      <div className="table-footer">
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            {">"}
          </button>
        </div>
        <div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // reset to first page
            }}
          >
            <option value={10}>10/page</option>
            <option value={15}>15/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>
          <span style={{ marginLeft: 8 }}>{totalResults} result(s)</span>
        </div>
      </div>
    </div>
  );
}
