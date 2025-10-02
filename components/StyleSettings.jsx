'use client';
import { useState, useEffect } from 'react';

const STYLE_OPTIONS = [
  'Anime',
  'Animals',
  'Politicians',
  'Countries',
  'Celebrities',
  'Cartoons',
  'Other',
  'Everything',
];

export default function StyleSettings({ onChange }) {
  const [active, setActive] = useState(new Set(STYLE_OPTIONS));

  useEffect(() => {
    console.log('Active Styles:', Array.from(active));
    if(onChange) onChange(active);
  }, [active]);

  const toggleOption = (option) => {
    setActive((prev) => {
      const newSet = new Set(prev);

      if (option === 'Everything') {
        return new Set(STYLE_OPTIONS);
      }

      if (newSet.has(option)) {
        newSet.delete(option);
        if (newSet.size === 0) newSet.add(option);
        newSet.delete('Everything');
      } else {
        newSet.add(option);
        const allExceptEverything = STYLE_OPTIONS.filter((o) => o !== 'Everything');
        if (allExceptEverything.every((o) => newSet.has(o))) newSet.add('Everything');
      }

      return newSet;
    });
  };

  return (
    <div className="flex flex-col gap-3 mt-2">
      {STYLE_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => toggleOption(option)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors 
            ${
              active.has(option)
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
