"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Gamepad2, Download } from "lucide-react";

const GameDownloadCalculator = () => {
  const [gameSize, setGameSize] = useState("80");
  const [gameUnit, setGameUnit] = useState("GB");
  const [speed, setSpeed] = useState("100");
  const [speedUnit, setSpeedUnit] = useState("Mbps");
  const [readyToPlay, setReadyToPlay] = useState("20");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let sizeInBytes = parseFloat(gameSize) || 0;
    const units: any = { "MB": 1024 ** 2, "GB": 1024 ** 3, "TB": 1024 ** 4 };
    sizeInBytes *= units[gameUnit] || 1;

    let speedInBps = parseFloat(speed) || 0;
    const sUnits: any = { "Mbps": 1000 ** 2, "Gbps": 1000 ** 3 };
    speedInBps *= sUnits[speedUnit] || 1;

    if (sizeInBytes <= 0 || speedInBps <= 0) return;

    // effective speed (overhead 5%)
    const effectiveBps = speedInBps * 0.95;
    const totalSeconds = (sizeInBytes * 8) / effectiveBps;
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    const readySeconds = totalSeconds * (parseFloat(readyToPlay) / 100);
    const rh = Math.floor(readySeconds / 3600);
    const rm = Math.floor((readySeconds % 3600) / 60);

    setResults({
      time: `${h > 0 ? h + "h " : ""}${m}m`,
      readyTime: `${rh > 0 ? rh + "h " : ""}${rm}m`,
      totalSeconds,
      mbPerSec: effectiveBps / (8 * 1024 ** 2)
    });
  };

  const reset = () => {
    setShowResults(false);
    setGameSize("80"); setGameUnit("GB");
    setSpeed("100"); setSpeedUnit("Mbps");
    setReadyToPlay("20");
    setResults(null);
  };

  const faqs = [
    { question: "Why is the Steam download speed different from my speed test?", answer: "Steam often measures in MB/s (Megabytes per second), while speed tests measure in Mbps (Megabits per second). 100 Mbps is equivalent to about 12.5 MB/s." },
    { question: "What is 'Ready to Play'?", answer: "Many modern platforms like PS5, Xbox, and Battle.net allow you to start the game after only a fraction of the total data (usually the first level or main menu) is downloaded." },
    { question: "How can I speed up game downloads?", answer: "Pause other downloads, use a wired Ethernet connection, and check if your launcher (like Steam) has a 'limit bandwidth' setting enabled in the options." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Game Download Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Game Download Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="gameSize" label="Game Install Size" value={gameSize} onChange={setGameSize} />
                  </div>
                  <div className="w-24 mt-7">
                    <select value={gameUnit} onChange={(e) => setGameUnit(e.target.value)} className="input-calc">
                      <option>MB</option><option>GB</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField id="speed" label="Internet Speed" value={speed} onChange={setSpeed} />
                  </div>
                  <div className="w-28 mt-7">
                    <select value={speedUnit} onChange={(e) => setSpeedUnit(e.target.value)} className="input-calc">
                      <option>Mbps</option><option>Gbps</option>
                    </select>
                  </div>
                </div>
                <InputField id="ready" label="Ready to Play %" value={readyToPlay} onChange={setReadyToPlay} suffix="%" tooltip="Percentage required to launch the game." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Download Forecast</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Time to 100%</p>
                    <p className="text-5xl font-black text-foreground">{results.time}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Time to "Ready to Play"</p>
                    <p className="text-4xl font-black text-foreground">{results.readyTime}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Download Rate", value: 0, textValue: results.mbPerSec.toFixed(1) + " MB/s" },
                  { label: "Total Data (Binary)", value: 0, textValue: gameSize + " " + gameUnit },
                  { label: "Platform Overhead", value: 0, textValue: "5% (Included)" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Wait Less, Play More</h2>
              <p>With modern games like *Call of Duty* or *Baldur's Gate 3* reaching over 100GB, download time is a serious consideration. Understanding your real-world transfer rate helps you plan your gaming sessions.</p>
              <h3>Why is my speed fluctuating?</h3>
              <p>Game downloads aren't just about moving data; your computer is also decompressing and installing files as they arrive. If your CPU or Disk is slow, the download may pause to let the installation catch up. This is very common on launchers like Steam or the EA App.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/game-download" />
          <PopularCalculators exclude="/calculator/game-download-calculator" />
        </div>
      </div>
    </>
  );
};

export default GameDownloadCalculator;

