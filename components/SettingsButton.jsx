'use client';
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import StyleSettings from "./StyleSettings"; // import the component

export default function SettingsButton({ setAllowedTypes }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 focus:outline-none"
      >
        <FontAwesomeIcon icon={fas.faGear} size="lg" />
      </button>

      {/* Settings panel */}
      {open && (
        <div className="fixed top-20 right-4 z-40 w-64 rounded-lg bg-gray-900 p-4 shadow-xl border border-gray-700">
          <h3 className="text-white font-semibold mb-2">Styles Mode</h3>
          <StyleSettings onChange={(set) => setAllowedTypes?.(set)} />
        </div>
      )}
    </>
  );
}
