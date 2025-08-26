// import React from "react";

// export default function DownloadPath({ value, onChange }) {
//   // Handler when user types manually
//   const handleInputChange = (e) => {
//     onChange(e.target.value);
//   };

//   // Handler when user clicks Browse button (works in Chromium-based browsers)
//   const handleBrowse = async () => {
//     if (window.showDirectoryPicker) {
//       try {
//         const dirHandle = await window.showDirectoryPicker();
//         // For now, just show the folder name (real path is not exposed in browser)
//         onChange(dirHandle.name);
//       } catch (err) {
//         console.error("Folder selection cancelled", err);
//       }
//     } else {
//       alert("⚠️ Folder picker not supported in this browser.");
//     }
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <label className="w-24">Directory</label>
//       <input
//         type="text"
//         value={value}
//         onChange={handleInputChange}
//         placeholder="Select download folder"
//         className="flex-1 border rounded px-2 py-1"
//       />
//       <button
//         type="button"
//         onClick={handleBrowse}
//         className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
//       >
//         📂 Browse
//       </button>
//     </div>
//   );
// }
import React from "react";

export default function DownloadPath({ value, onChange }) {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="w-24">Recording store Directory: </label>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Enter full download path"
        className="flex-1 border rounded px-2 py-1"
        style={{ width: "400px" }}
      />
    </div>
  );
}
