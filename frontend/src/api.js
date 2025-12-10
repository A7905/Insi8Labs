const BASE ="http://localhost:5000";

export function uploadFile(file, onUploadProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/documents/upload`, true);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const percent = Math.round((evt.loaded / evt.total) * 100);
      if (typeof onUploadProgress === "function") onUploadProgress({ loaded: evt.loaded, total: evt.total, percent });
    };

    xhr.onload = () => {
      try {
        const status = xhr.status;
        const text = xhr.responseText || "";
        const json = text ? JSON.parse(text) : null;
        if (status >= 200 && status < 300) resolve(json);
        else {
          const message = (json && (json.message || json.error)) || xhr.statusText || "Upload failed";
          const err = new Error(message);
          err.status = status;
          err.response = json;
          reject(err);
        }
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    const form = new FormData();
    form.append("file", file);

    xhr.send(form);
  });
}

export async function listDocuments() {
  const res = await fetch(`${BASE}/documents`, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to fetch documents: ${res.status}`);
  }
  return res.json();
}

export async function deleteDocument(id) {
  const res = await fetch(`${BASE}/documents/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to delete document: ${res.status}`);
  }
  try { return await res.json(); } catch { return null; }
}

export function downloadUrl(id) {
  return `${BASE}/documents/${id}`;
}
