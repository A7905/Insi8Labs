import React, { useEffect, useState } from "react";
import { listDocuments, deleteDocument, downloadUrl } from "../api";

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
      setActionMsg({ type: "error", text: "Failed to load documents." });
    } finally {
      setLoading(false);
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  useEffect(() => {
    refresh();
    // listen for uploads from upload page
    const handler = () => refresh();
    window.addEventListener("documents:uploaded", handler);
    return () => window.removeEventListener("documents:uploaded", handler);
  }, []);

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setActionMsg({ type: "success", text: "Deleted successfully." });
      await refresh();
    } catch (err) {
      console.error(err);
      setActionMsg({ type: "error", text: "Delete failed." });
    } finally {
      setDeletingId(null);
      setTimeout(() => setActionMsg(null), 2500);
    }
  };

  return (
    <div className="max-w-max w-full flex flex-col h-full justify-center items-center mx-auto my-auto">
      <div className="flex items-center justify-between w-full border-b pb-3 mb-4">
        <h2 className="font-bold text-xl underline">My Documents</h2>
        <div className="w-24  ">
          <button className="text-blue-500  mx-3 text-center border border-blue-500 p-1 rounded-md hover:bg-blue-500 hover:text-white " onClick={refresh} disabled={loading}>Refresh</button>
        </div>
      </div>

      {actionMsg && <div className={`message ${actionMsg.type}`}>{actionMsg.text}</div>}

      {loading ? (
        <div className="text-center mt-16 font-semibold">Loading...</div>
      ) : docs.length === 0 ? (
        <div className="flex text-center flex-col items-center mt-16 text-gray-500">
          <strong>No documents yet</strong>
          <p className="muted">Upload your first medical document from the Upload page.</p>
        </div>
      ) : (
        <div className="w-full">
          <table className="border-collapse w-full">
            <thead className="">
              <tr className="border border-black">
                <th className="border-r-2 border-black">#</th>
                <th className="border-r-2 border-black">Filename</th>
                <th className="border-r-2 border-black">Size</th>
                <th className="border-r-2 border-black">Uploaded At</th>
                <th className="border-r-2 border-black">Last Opened</th>   {/* new column */}
                <th className="border-r-2 border-black">Actions</th>
              </tr>
            </thead>
            <tbody className="border border-black">
              {docs.map((d, idx) => (
                <tr className="border border-black" key={d.id}>
                  <td className="border-r-2 border-black">{idx + 1}</td>
                  <td className="border-r-2 border-black">{d.filename}</td>
                  <td className="border-r-2 border-black">{Math.round(d.filesize / 1024)} KB</td>
                  <td className="border-r-2 border-black">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="border-r-2 border-black">{d.last_accessed ? new Date(d.last_accessed).toLocaleString() : (<span className="text-gray-400 italic">Never</span>)}</td> {/* use last_accessed */}
                  <td className="border-r-2 border-black">
                   <a
                      className="border border-blue-500 text-blue-500 px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white"
                      href={downloadUrl(d.id)}
                      download={d.filename}
                      >
                      Download
                    </a>

                    <button
                      className="border border-red-500 text-red-500 px-2 py-1 rounded-md hover:bg-red-500 hover:text-white ml-2"
                      onClick={() => handleDelete(d.id, d.filename)}
                      disabled={deletingId === d.id}
                    >
                      {deletingId === d.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}


