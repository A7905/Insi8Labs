import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const loc = useLocation();
  return (
    <header className="w-full h-4 py-6  mb-8 border-b-4 border-blue-500">
      <div className=" flex items-center justify-between">
        <div className="flex items-center space-x-3 mt-10">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="1" y="1" width="22" height="22" rx="6" fill="#1f6feb"/>
            <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="font-bold text-small">
            <div className="">Patient Document Portal</div>
            <div className="">Secure medical PDF storage</div>
          </div>
        </div>

        <nav className="space-x-8 text-lg font-medium flex justify-center pt-4">
            <Link
              to="/"
              className={`pb-2 border-b-2 ${
                loc.pathname === "/" ? "border-blue-500 text-blue-600" : "border-transparent"
              }`}
            >
              Upload
            </Link>

            <Link
              to="/documents"
              className={`pb-2 border-b-2 ${
                loc.pathname === "/documents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent"
              }`}
            >
              My Documents
            </Link>
        </nav>

      </div>
    </header>
  );
}
