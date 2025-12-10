import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./components/UploadPage";
import DocumentsPage from "./components/DocumentsPage";
import Header from "./components/Header";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-4xl mx-auto px-4">
        <Header />
        <main className="w-450px mx-auto mt-8 mb-16 flex flex-col min-h-[400px]">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Routes>
        </main>
        <footer className="w-full text-center text-sm text-gray-500 my-8">
          © {new Date().getFullYear()} Patient Document Portal — Demo
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
