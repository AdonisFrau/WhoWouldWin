import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import SettingsButton from "../components/SettingsButton.jsx";
import BattleEngine from '../components/BattleEngine';
import { useState } from 'react';
import StyleSettings from '../components/StyleSettings';




export default function Home() {
  const [allowedTypes, setAllowedTypes] = useState(new Set([
    'Anime','Animals','Politicians','Countries','Celebrities','Cartoons','Other','Everything'
  ]));

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-4 p-4">
      {/* settings + engine: no extra wrapper */}
      <SettingsButton setAllowedTypes={setAllowedTypes} />
      <BattleEngine allowedTypes={allowedTypes} />

      <div
        id="LeftSide"
        className="relative flex-1 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-400 to-blue-600 z-0" />
        <img src="/img/Placeholder.png" className="object-cover opacity-20 z-0 absolute inset-0 w-full h-full" />
        <p className="Left_text text-white fredoka-custom relative z-10">Left side name!</p>
      </div>

      <div
        id="RightSide"
        className="relative flex-1 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-red-400 to-red-600 z-0" />
        <img src="/img/Placeholder.png" className="object-cover opacity-20 z-0 absolute inset-0 w-full h-full" />
        <p className="Right_text text-white fredoka-custom relative z-10">Right side name</p>
      </div>
    </div>
  );
}
