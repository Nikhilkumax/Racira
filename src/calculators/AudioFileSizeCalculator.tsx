"use client";
import { RotateCcw, Clock, HardDrive, Settings } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const AudioFileSizeCalculator = () => {
  const [duration, setDuration] = useState("4"); // Minutes
  const [bitrate, setBitrate] = useState("320"); // kbps
  const [format, setFormat] = useState("compressed"); // compressed, uncompressed

  // Uncompressed settings
  const [sampleRate, setSampleRate] = useState("44100"); // Hz
  const [bitDepth, setBitDepth] = useState("16"); // bits
  const [channels, setChannels] = useState("2"); // 1=Mono, 2=Stereo

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const durSec = (parseFloat(duration) || 0) * 60;
    let totalSizeBytes = 0;

    if (format === "compressed") {
      const bRate = parseFloat(bitrate) || 0;
      // Size = bitrate (kbps) * duration (sec)
      totalSizeBytes = (bRate * 1000 * durSec) / 8;
    } else {
      const sRate = parseFloat(sampleRate) || 0;
      const bDepth = parseFloat(bitDepth) || 0;
      const ch = parseFloat(channels) || 1;
      // Size = sample rate * bit depth * channels * duration
      totalSizeBytes = (sRate * bDepth * ch * durSec) / 8;
    }

    const totalMB = totalSizeBytes / (1024 * 1024);

    setResults({
      totalMB,
      totalBytes: totalSizeBytes,
      bitrate: format === "compressed" ? bitrate : (parseFloat(sampleRate) * parseFloat(bitDepth) * parseFloat(channels) / 1000).toFixed(0)
    });
  };

  const reset = () => {
    setDuration("4");
    setBitrate("320");
    setFormat("compressed");
    setSampleRate("44100");
    setBitDepth("16");
    setChannels("2");
  };

  const faqs = [
    { question: "What is the best bitrate for MP3s?", answer: "320 kbps is the highest bitrate supported by the MP3 format and is considered 'near CD quality'. Most listeners cannot distinguish between a 256 kbps or 320 kbps file and the original source." },
    { question: "How large is a standard CD audio track?", answer: "Uncompressed CD audio (PCM) uses a sample rate of 44.1 kHz, 16-bit depth, and 2 channels. This results in a bitrate of 1,411 kbps, or approximately 10.5 MB per minute of audio." },
    { question: "What is lossless compression (FLAC)?", answer: "FLAC and ALAC are lossless formats that reduce file size (typically by 30-50%) without removing any audio data. When played back, the audio is bit-for-bit identical to the uncompressed source." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Audio File Size Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Audio File Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" /> Track Info
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Duration (Minutes)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="input-calc" min="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Audio Type</label>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setFormat("compressed")}
                         className={`flex-1 p-3 rounded-xl border font-bold text-xs transition-colors ${format === "compressed" ? "bg-primary text-white border-primary" : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"}`}
                       >
                         Compressed
                       </button>
                       <button 
                         onClick={() => setFormat("uncompressed")}
                         className={`flex-1 p-3 rounded-xl border font-bold text-xs transition-colors ${format === "uncompressed" ? "bg-primary text-white border-primary" : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"}`}
                       >
                         Uncompressed
                       </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-primary" /> {format === "compressed" ? "Compression" : "Technical Specs"}
                  </h2>
                  
                  {format === "compressed" ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Bitrate (kbps)</label>
                      <select value={bitrate} onChange={(e) => setBitrate(e.target.value)} className="input-calc">
                        <option value="64">64 kbps (Podcast/Voice)</option>
                        <option value="128">128 kbps (Standard Radio)</option>
                        <option value="192">192 kbps (High Quality)</option>
                        <option value="256">256 kbps (AAC/iTunes)</option>
                        <option value="320">320 kbps (Max MP3)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Sample Rate</label>
                            <select value={sampleRate} onChange={(e) => setSampleRate(e.target.value)} className="input-calc text-xs">
                              <option value="44100">44.1 kHz (CD)</option>
                              <option value="48000">48 kHz (Video)</option>
                              <option value="96000">96 kHz (Studio)</option>
                              <option value="192000">192 kHz (Ultra)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Bit Depth</label>
                            <select value={bitDepth} onChange={(e) => setBitDepth(e.target.value)} className="input-calc text-xs">
                              <option value="16">16-bit (CD)</option>
                              <option value="24">24-bit (Pro)</option>
                              <option value="32">32-bit (Float)</option>
                            </select>
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Channels</label>
                          <select value={channels} onChange={(e) => setChannels(e.target.value)} className="input-calc text-xs">
                            <option value="1">Mono (1)</option>
                            <option value="2">Stereo (2)</option>
                          </select>
                       </div>
                    </div>
                  )}
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-10 mb-6">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated File Size</p>
                    <p className="text-6xl font-black text-foreground">
                       {results.totalMB.toFixed(1)} <span className="text-3xl font-normal text-muted-foreground">MB</span>
                    </p>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <HardDrive className="h-5 w-5 text-primary" /> Technical Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Format Type", value: 0, textValue: format.charAt(0).toUpperCase() + format.slice(1) },
                    { label: "Effective Bitrate", value: 0, textValue: results.bitrate + " kbps" },
                    { label: "Total Space Required", value: 0, textValue: (results.totalMB * 1024 * 1024).toLocaleString() + " bytes" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Digital Audio Science</h2>
              <p>Digital audio is created by sampling a continuous sound wave at regular intervals. The frequency of these intervals is called the sample rate, and the precision of each sample is called the bit depth.</p>
              
              <h3>Lossy vs. Lossless</h3>
              <p>Uncompressed audio (like WAV) stores every single sample taken. This results in massive files but perfect quality. Lossy formats like MP3 and AAC use psychoacoustic modeling to remove frequencies that the human ear cannot easily hear, allowing for file sizes that are 90% smaller with minimal perceived loss in quality.</p>

              <h3>High-Resolution Audio</h3>
              <p>While CD quality (44.1 kHz / 16-bit) covers the entire frequency range audible to humans, many audiophiles and professionals prefer "High-Res" audio (96 kHz or 192 kHz / 24-bit). These formats provide a lower noise floor and greater dynamic range, though they require significantly more storage space and high-end playback equipment to be appreciated.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/audio-file-size" />
          <PopularCalculators exclude="/calculator/audio-file-size-calculator" />
        </div>
      </div>
    </>
  );
};

export default AudioFileSizeCalculator;

