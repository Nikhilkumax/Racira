"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { saveAs } from "file-saver";

/* ── Types ─────────────────────────────────────────────────── */

interface ScanSettings {
  grayscale: boolean;
  border: boolean;
  rotate: number;
  rotateVariance: number;
  brightness: number;
  contrast: number;
  blur: number;
  noise: number;
  yellowish: number;
  resolution: number;
}

type ToolState = "idle" | "loading" | "preview" | "processing" | "done" | "error";

const DEFAULT_SETTINGS: ScanSettings = {
  grayscale: false,
  border: false,
  rotate: 0,
  rotateVariance: 0,
  brightness: 0,
  contrast: 0,
  blur: 0,
  noise: 10,
  yellowish: 0,
  resolution: 150,
};

/* ── Canvas Effects (from Bento's image-effects.ts) ─────── */

function applyScannerEffect(
  sourceData: ImageData,
  canvas: HTMLCanvasElement,
  settings: ScanSettings
): void {
  const ctx = canvas.getContext("2d")!;
  const w = sourceData.width;
  const h = sourceData.height;

  const workCanvas = document.createElement("canvas");
  workCanvas.width = w;
  workCanvas.height = h;
  const workCtx = workCanvas.getContext("2d")!;

  if (settings.blur > 0) {
    workCtx.filter = `blur(${settings.blur}px)`;
  }

  workCtx.putImageData(sourceData, 0, 0);
  if (settings.blur > 0) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.filter = `blur(${settings.blur}px)`;
    tempCtx.drawImage(workCanvas, 0, 0);
    workCtx.filter = "none";
    workCtx.clearRect(0, 0, w, h);
    workCtx.drawImage(tempCanvas, 0, 0);
  }

  const imageData = workCtx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const contrastFactor =
    settings.contrast !== 0
      ? (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast))
      : 1;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (settings.grayscale) {
      const grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      r = grey; g = grey; b = grey;
    }

    if (settings.brightness !== 0) {
      r += settings.brightness; g += settings.brightness; b += settings.brightness;
    }

    if (settings.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    if (settings.yellowish > 0) {
      const intensity = settings.yellowish / 50;
      r += 20 * intensity; g += 12 * intensity; b -= 15 * intensity;
    }

    if (settings.noise > 0) {
      const n = (Math.random() - 0.5) * settings.noise;
      r += n; g += n; b += n;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
}

/* ── Component ─────────────────────────────────────────────── */

export default function ScannerEffectTool() {
  const [state, setState] = useState<ToolState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [settings, setSettings] = useState<ScanSettings>({ ...DEFAULT_SETTINGS });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileRef = useRef<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      setState("error");
      return;
    }

    fileRef.current = file;
    setFileName(file.name);
    setError(null);
    setState("loading");

    try {
      // Render first page to canvas for preview
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: settings.resolution / 72 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply default effects
      const effectCanvas = document.createElement("canvas");
      effectCanvas.width = canvas.width;
      effectCanvas.height = canvas.height;
      applyScannerEffect(imageData, effectCanvas, settings);

      setPreviewUrl(effectCanvas.toDataURL("image/png"));
      canvasRef.current = effectCanvas;
      setState("preview");
    } catch (e) {
      console.error("Failed to load PDF:", e);
      setError(e instanceof Error ? e.message : "Failed to load PDF");
      setState("error");
    }
  }, [settings.resolution]);

  const updateSetting = useCallback(<K extends keyof ScanSettings>(key: K, value: ScanSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const handleSave = useCallback(async () => {
    if (!fileRef.current || !canvasRef.current) return;
    setState("processing");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await fileRef.current.arrayBuffer();
      const srcDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const pdfDoc = await PDFDocument.create();

      for (let i = 1; i <= srcDoc.numPages; i++) {
        const page = await srcDoc.getPage(i);
        const viewport = page.getViewport({ scale: settings.resolution / 72 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyScannerEffect(imageData, canvas, settings);

        const pngDataUrl = canvas.toDataURL("image/png");
        const pngBytes = Uint8Array.from(atob(pngDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
        const img = await pdfDoc.embedPng(pngBytes);

        const pdfPage = pdfDoc.addPage([img.width, img.height]);
        pdfPage.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const savedBytes = await pdfDoc.save();
      const blob = new Blob([savedBytes as any], { type: "application/pdf" });
      saveAs(blob, fileName || "scanned.pdf");
      setState("done");
    } catch (e) {
      console.error("Failed to save PDF:", e);
      setError(e instanceof Error ? e.message : "Failed to save PDF");
      setState("error");
    }
  }, [fileName, settings]);

  const handleReset = useCallback(() => {
    fileRef.current = null;
    setFileName("");
    setPreviewUrl(null);
    setError(null);
    setSettings({ ...DEFAULT_SETTINGS });
    setState("idle");
  }, []);

  // ── Render ──────────────────────────────────────────────────

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-green-400 text-4xl mb-4">✓</div>
        <p className="text-green-300 mb-2">PDF saved with scanner effect</p>
        <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Process Another</button>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div data-state="loading" className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-muted-foreground">Rendering PDF preview…</p>
      </div>
    );
  }

  if (state === "preview" || state === "processing") {
    return (
      <div data-state="preview" className="w-full max-w-6xl mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Preview */}
          <div className="flex-1 bg-card rounded-lg border border-border p-4 overflow-auto max-h-[60vh]">
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="max-w-full mx-auto" />
            )}
          </div>

          {/* Controls */}
          <div className="w-full lg:w-72 space-y-4">
            <h3 className="font-semibold text-foreground">Scanner Settings</h3>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.grayscale} onChange={(e) => updateSetting("grayscale", e.target.checked)} className="rounded" />
              Grayscale
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.border} onChange={(e) => updateSetting("border", e.target.checked)} className="rounded" />
              Add border
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.yellowish > 0} onChange={(e) => updateSetting("yellowish", e.target.checked ? 20 : 0)} className="rounded" />
              Yellowish tint
            </label>

            <div>
              <label className="text-sm text-muted-foreground">Brightness: {settings.brightness}</label>
              <input type="range" min={-100} max={100} value={settings.brightness} onChange={(e) => updateSetting("brightness", parseInt(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Contrast: {settings.contrast}</label>
              <input type="range" min={-100} max={100} value={settings.contrast} onChange={(e) => updateSetting("contrast", parseInt(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Blur: {settings.blur}</label>
              <input type="range" min={0} max={10} step={0.5} value={settings.blur} onChange={(e) => updateSetting("blur", parseFloat(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Noise: {settings.noise}</label>
              <input type="range" min={0} max={50} value={settings.noise} onChange={(e) => updateSetting("noise", parseInt(e.target.value))} className="w-full" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={resetSettings} className="flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-sm rounded-lg">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={state === "processing"}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50"
              >
                {state === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Save PDF
              </button>
            </div>

            <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground">
              ← Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // idle — upload UI
  return (
    <div data-state="idle" className="flex flex-col items-center justify-start py-8">
      <div className="bg-card rounded-xl shadow-xl px-6 py-8 max-w-2xl w-full border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Scanner Effect</h2>
        <p className="text-muted-foreground mb-6">Apply a realistic scanner effect to your PDF — grayscale, noise, blur, and more.</p>

        <div
          className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-muted/50 transition-all"
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Click to select a file</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PDF file</p>
          </div>
          <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      </div>
    </div>
  );
}
