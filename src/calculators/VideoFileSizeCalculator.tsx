"use client";
import { RotateCcw, Zap, Clock, HardDrive } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const VideoFileSizeCalculator = () => {
  const [duration, setDuration] = useState("60"); // Minutes
  const [bitrate, setBitrate] = useState("8"); // Mbps
  const [audioBitrate, setAudioBitrate] = useState("192"); // kbps

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const durSec = (parseFloat(duration) || 0) * 60;
    const vBitrate = parseFloat(bitrate) || 0;
    const aBitrate = parseFloat(audioBitrate) || 0;

    // Video size = bitrate (bits/sec) * duration (sec)
    // 1 Mbps = 1,000,000 bits per second
    const videoSizeBytes = (vBitrate * 1000000 * durSec) / 8;
    const audioSizeBytes = (aBitrate * 1000 * durSec) / 8;

    const totalSizeBytes = videoSizeBytes + audioSizeBytes;
    const totalMB = totalSizeBytes / (1024 * 1024);
    const totalGB = totalMB / 1024;

    setResults({
      totalMB,
      totalGB,
      videoMB: videoSizeBytes / (1024 * 1024),
      audioMB: audioSizeBytes / (1024 * 1024)
    });
  };

  const reset = () => {
    setDuration("60");
    setBitrate("8");
    setAudioBitrate("192");
  };

  const faqs = [
    { question: "What is a good bitrate for 1080p video?", answer: "For 1080p (30fps) video, a bitrate of 8 Mbps to 12 Mbps is generally recommended for high-quality YouTube or web streaming. For 60fps, 12-15 Mbps is better." },
    { question: "How does resolution affect file size?", answer: "Resolution doesn't directly determine file size; bitrate does. However, higher resolutions require higher bitrates to maintain visual quality. A 4K video with the same bitrate as a 1080p video will have the same file size but much lower visual quality (more compression artifacts)." },
    { question: "What is CBR vs VBR?", answer: "CBR (Constant Bitrate) keeps the same data rate throughout the video. VBR (Variable Bitrate) increases the bitrate during complex scenes (lots of motion) and decreases it during static scenes to optimize file size vs. quality." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Video File Size Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Video File Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Clock className="h-5 w-5 text-primary" /> Duration
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Total Duration (Minutes)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="input-calc" min="0" />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={() => setDuration("1")} className="px-3 py-1 rounded bg-secondary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors">1m</button>
                    <button onClick={() => setDuration("10")} className="px-3 py-1 rounded bg-secondary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors">10m</button>
                    <button onClick={() => setDuration("60")} className="px-3 py-1 rounded bg-secondary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors">1h</button>
                    <button onClick={() => setDuration("120")} className="px-3 py-1 rounded bg-secondary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors">2h</button>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Zap className="h-5 w-5 text-primary" /> Quality Settings
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Video Bitrate (Mbps)</label>
                    <input type="number" value={bitrate} onChange={(e) => setBitrate(e.target.value)} className="input-calc" min="0.1" step="0.5" />
                    <p className="text-[10px] text-muted-foreground mt-1">YouTube 1080p: ~8 Mbps | 4K: ~40 Mbps</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Audio Bitrate (kbps)</label>
                    <select value={audioBitrate} onChange={(e) => setAudioBitrate(e.target.value)} className="input-calc">
                      <option value="64">64 kbps (Mono)</option>
                      <option value="128">128 kbps (Standard)</option>
                      <option value="192">192 kbps (High Quality)</option>
                      <option value="320">320 kbps (Extreme)</option>
                    </select>
                  </div>
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
                      {results.totalGB >= 1 
                        ? <>{results.totalGB.toFixed(2)} <span className="text-3xl font-normal text-muted-foreground">GB</span></>
                        : <>{results.totalMB.toFixed(0)} <span className="text-3xl font-normal text-muted-foreground">MB</span></>
                      }
                    </p>
                </div>

                <div className="card-calculator">
                  <h2 className="text-2xl font-bold mb-3">
                    <HardDrive className="h-5 w-5 text-primary" /> Component Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Video Data", value: 0, textValue: results.videoMB.toFixed(1) + " MB" },
                    { label: "Audio Data", value: 0, textValue: results.audioMB.toFixed(1) + " MB" },
                    { label: "Total Data Rate", value: 0, textValue: (parseFloat(bitrate) + (parseFloat(audioBitrate)/1000)).toFixed(2) + " Mbps" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Video Compression Fundamentals</h2>
              <p>The file size of any video is determined by two main factors: duration and bitrate. Bitrate represents the amount of data processed per second. If you know these two numbers, you can precisely calculate the final file size regardless of the resolution or frame rate.</p>
              
              <h3>Bitrate vs. Quality</h3>
              <p>Bitrate is the primary control for video quality. A higher bitrate allows for more detail and fewer artifacts in motion-heavy scenes but results in a larger file size. Modern codecs like H.264, H.265 (HEVC), and AV1 are designed to maintain high visual quality at increasingly lower bitrates.</p>

              <h3>Container vs. Codec</h3>
              <p>Don't confuse the file extension (MP4, MKV, MOV) with the video itself. The extension is a "container" that holds the video and audio streams. The "codec" (like H.264) is the mathematical algorithm that actually compresses the data. Most modern containers have very little impact on the final file size compared to the bitrate of the streams inside them.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/video-file-size" />
          <PopularCalculators exclude="/calculator/video-file-size-calculator" />
        </div>
      </div>
    </>
  );
};

export default VideoFileSizeCalculator;

