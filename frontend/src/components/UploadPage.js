import React, { useState } from "react";
import { uploadFile } from "../api";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onFileChange = (e) => {
    setMessage(null);
    const f = e.target.files[0];
    if (!f) { setFile(null); return; }

    // Validate PDF
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setMessage({ type: "error", text: "Only PDF files allowed." });
      setFile(null);
      e.target.value = null;
      return;
    }
    // optional size limit
    const max = 20 * 1024 * 1024;
    if (f.size > max) {
      setMessage({ type: "error", text: "File too large (max 20 MB)." });
      setFile(null);
      e.target.value = null;
      return;
    }
    setFile(f);
  };

  const onUpload = async () => {
    if (!file) return setMessage({ type: "error", text: "Choose a PDF to upload." });
    setUploading(true);
    setProgress(0);
    setMessage(null);
    try {
      await uploadFile(file, (evt) => {
        // evt.percent object from api.js
        setProgress(evt.percent ?? Math.round((evt.loaded / evt.total) * 100));
      });
      setMessage({ type: "success", text: (<span className="text-green-600 italic">Upload successful!</span>) });
      setFile(null);
      // notify other pages to refresh
      window.dispatchEvent(new Event("documents:uploaded"));
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err?.message || "Upload failed." });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3500);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="h-sceen flex items-center justify-center mt-8">
        <div className="w-6/12" aria-hidden>
          <svg viewBox="0 0 80 80" className="illustration-svg">
            <rect x="6" y="14" rx="6" width="68" height="52" fill="#f2f6ff" />
            <path d="M26 34h28M26 44h20" stroke="#1f6feb" strokeWidth="2" strokeLinecap="round"/>
            <path d="M40 18v8" stroke="#1f6feb" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div className=" flex flex-col space-y-4">
        <h2 className="font-medium space-y-4 text-lg">Upload PDF!</h2>
        <p className="">Add prescriptions, test results or referral notes (PDF only). <span className="font-bold">*</span></p>

        <label className=" w-full flex flex-col items-center px-2 py-4 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
          <input type="file" accept="application/pdf" onChange={onFileChange} disabled={uploading}/>
          <span className="">Choose file</span>
          <span className="">{file ? file.name : "No file chosen"}</span>
        </label>

        {file && (
          <div className="text-xs space-y-1">
            <div><strong>Size:</strong> {Math.round(file.size / 1024)} KB</div>
          </div>
        )}

        <div className="flex space-x-4">
          <button className="text-white cursor-pointer p-2 bg-blue-600 rounded-md" onClick={onUpload} disabled={!file || uploading}>
            {uploading ? `Uploading ${progress}%` : "Upload"}
          </button>
          <button className="text-white cursor-pointer p-2 bg-red-600 rounded-md" onClick={() => { setFile(null); setMessage(null); }}>
            Clear
          </button>
        </div>

        {uploading && (
          <div className="">
            <div className="" style={{ width: `${progress}%` }}>{progress}%</div>
          </div>
        )}

        {message && <div className={`message ${message.type}`}>{message.text}</div>}

        <p className="w-full font-semibold right-0 text-gray-600">Only PDF files. Max size 20 MB.*</p>
      </div>
    </div>
  );
}
