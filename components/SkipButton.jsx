import React from "react";

const SkipButton = ({ onClick }) => {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      try { onClick(); } catch (e) { console.error(e); }
      return;
    }

    // fallback to global nextBattle if available
    try {
      if (typeof window?.nextBattle === 'function') window.nextBattle();
    } catch (e) {
      console.error('SkipButton: nextBattle failed', e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-6 bottom-6 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg border-2 border-blue-800 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl active:scale-95 z-50"
    >
      Skip →
    </button>
  );
};

export default SkipButton;
