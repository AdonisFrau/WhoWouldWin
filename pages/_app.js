// pages/_app.js
import "../Styles/globals.css"
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["300","400","500","600","700"] });

// add the new DeathDialog component
import DeathDialog from "../components/DeathDialog";

export default function MyApp({ Component, pageProps }) {
  return (
    <main className={fredoka.className}>
      <Component {...pageProps} />
      <DeathDialog />
    </main>
  );
}
