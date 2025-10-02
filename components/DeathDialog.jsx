'use client'
import { useEffect, useState } from "react";

export default function DeathDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // expose global functions for testing from the browser console
    const openFn = () => setOpen(true);

    // Named function
    window.Death = openFn;
    // Allow calling from console using window["Im dead"]()
    window["Im dead"] = openFn;

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      // cleanup
      try {
        delete window.Death;
        delete window["Im dead"];
      } catch (err) {
        // ignore if running in strict environments
      }
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* backdrop */}
      <div
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/70"
      />

      {/* panel */}
      <div className="relative mx-4 w-full max-w-lg rounded-lg bg-gray-900 ring-1 ring-white/10">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            {/* simple inline icon (no extra deps) */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/10">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">You Died</h3>
              <p className="mt-2 text-sm text-gray-300">
                You've been defeated. For testing you can reopen this dialog from the console by calling Death() or window["Im dead"]().
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/5 px-4 py-3">
          <button
            onClick={() => {
              setOpen(false);
              // placeholder for respawn logic
              // add custom behavior here if needed
            }}
            className="ml-auto inline-flex items-center rounded bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400"
          >
            Respawn
          </button>

          <button
            onClick={() => setOpen(false)}
            className="inline-flex items-center rounded bg-white/5 px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/5 hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}