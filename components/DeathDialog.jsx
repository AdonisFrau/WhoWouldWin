'use client'
import { useEffect, useState, useRef } from "react";

export default function DeathDialog() {
  const [open, setOpen] = useState(false);
  const adRefTop = useRef(null);
  const adRefBottom = useRef(null);

  useEffect(() => {
    // Expose global functions for triggering death dialog
    const openFn = () => setOpen(true);
    window.Death = openFn;
    window["Im dead"] = openFn;

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      try {
        delete window.Death;
        delete window["Im dead"];
      } catch {}
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Reload ads when dialog opens
  useEffect(() => {
    if (open) {
      try {
        // Safely recreate <ins> elements and initialize only uninitialized ones
        const createAd = (container, slot) => {
          if (!container) return null;
          // remove previous ad markup
          container.innerHTML = "";
          const ins = document.createElement("ins");
          ins.className = "adsbygoogle";
          ins.style.display = "block";
          ins.setAttribute("data-ad-client", "ca-pub-6868719082124854");
          ins.setAttribute("data-ad-slot", slot);
          ins.setAttribute("data-ad-format", "auto");
          ins.setAttribute("data-full-width-responsive", "true");
          container.appendChild(ins);
          return ins;
        };

        const topIns = createAd(adRefTop.current, "9642253588");
        const bottomIns = createAd(adRefBottom.current, "9642253588");

        if (window.adsbygoogle && typeof window.adsbygoogle.push === "function") {
          // push separately and only for elements that aren't already initialized
          try {
            if (topIns && !topIns.getAttribute("data-adsbygoogle-status")) {
              window.adsbygoogle.push({});
            }
          } catch (e) {
            console.warn("Top ad push failed:", e);
          }

          try {
            if (bottomIns && !bottomIns.getAttribute("data-adsbygoogle-status")) {
              window.adsbygoogle.push({});
            }
          } catch (e) {
            console.warn("Bottom ad push failed:", e);
          }
        }
      } catch (err) {
        console.error("Ad reload error:", err);
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* backdrop */}
      <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/70" />

      {/* panel */}
      <div className="relative mx-4 w-full max-w-lg rounded-lg bg-gray-900 ring-1 ring-white/10">
        <div className="px-6 py-6 space-y-4">
          {/* TOP AD */}
          <div ref={adRefTop}>
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-6868719082124854"
              data-ad-slot="9642253588"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          {/* dialog content */}
          <div className="flex items-start gap-4">
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
                You picked the wrong side, the opponent was way stronger than your pick. Try again!
              </p>
            </div>
          </div>

          {/* BOTTOM AD */}
          <div ref={adRefBottom}>
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-6868719082124854"
              data-ad-slot="9642253588"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/5 px-4 py-3">
          <button
            onClick={() => {
              setOpen(false);
              if (typeof window.nextBattle === 'function') {
                try { window.nextBattle(); } catch (e) { console.error(e); }
              }
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
