import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import SettingsButton from "../components/SettingsButton.jsx";
import BattleEngine from '../components/BattleEngine';
import SkipButton from '../components/SkipButton';
import { useState } from 'react';
import StyleSettings from '../components/StyleSettings';
import Head from "next/head";





export default function Home() {
  const [allowedTypes, setAllowedTypes] = useState(new Set([
    'Anime','Animals','Politicians','Countries','Celebrities','Cartoons','Other','Everything'
  ]));

 return (
  <>
    <Head>
      <title>Who Gonna Win? 🔥 | Battle & Vote Game</title>
      <link rel="icon" href="/favicon.ico" />
      <meta
        name="description"
        content="Who Gonna Win lets you vote between two sides — anime, animals, celebs, countries and more! Fun AI-driven face-offs updated weekly."
      />
      <meta
        name="keywords"
        content="battle game, vote, funny battles, who gonna win, ai comparison, meme battles"
      />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="WhoGonnaWin Team" />
      <meta property="og:title" content="Who Gonna Win? 🔥" />
      <meta
        property="og:description"
        content="Vote between two sides and see who wins! Updated weekly with hilarious matchups."
      />
      <meta property="og:url" content="https://whogonnawin.netlify.app/" />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content="https://whogonnawin.netlify.app/img/Placeholder.png"
      />
    </Head>

    <div className="flex flex-col md:flex-row min-h-screen gap-4 p-4">
      {/* settings + engine: no extra wrapper */}
      <SettingsButton setAllowedTypes={setAllowedTypes} />
      <BattleEngine allowedTypes={allowedTypes} />

      {/* Skip button - always visible in bottom-right */}
      <SkipButton
        onClick={() => {
          try {
            if (typeof window?.nextBattle === "function") window.nextBattle();
          } catch (e) {
            console.error("Skip failed", e);
          }
        }}
      />

      <div
        id="LeftSide"
        className="relative flex-1 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-400 to-blue-600 z-0" />
        <img
          src="/img/Placeholder.png"
          className="object-cover opacity-20 z-0 absolute inset-0 w-full h-full"
        />
        <p className="Left_text text-white fredoka-custom relative z-10">
          Left side name!
        </p>
      </div>

      <div
        id="RightSide"
        className="relative flex-1 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-red-400 to-red-600 z-0" />
        <img
          src="/img/Placeholder.png"
          className="object-cover opacity-20 z-0 absolute inset-0 w-full h-full"
        />
        <p className="Right_text text-white fredoka-custom relative z-10">
          Right side name
        </p>
      </div>
    </div>
  </>
);
}

