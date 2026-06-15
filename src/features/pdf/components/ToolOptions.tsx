"use client";

import { useState, useEffect, useCallback } from "react";
import type { ToolOptions as ToolOptionsType } from "@/lib/pdf-tools";
import PdfCropPreview from "@/components/PdfCropPreview";
import PdfPageSelector from "@/components/PdfPageSelector";

interface Props {
  slug: string;
  pageCount: number | null;
  onChange: (opts: ToolOptionsType) => void;
  file?: File;
  onProcess?: () => void;
  onReset?: () => void;
  processing?: boolean;
  done?: boolean;
}

const ToolOptionsPanel = ({ slug, pageCount, onChange, file, onProcess, onReset, processing: parentProcessing, done: parentDone }: Props) => {
  const [splitMode, setSplitMode] = useState<"all" | "range">("all");
  const [splitRange, setSplitRange] = useState("1-3");
  const [rotateAngle, setRotateAngle] = useState(90);
  const [rotateFilter, setRotateFilter] = useState<"all" | "portrait" | "landscape">("all");
  const [pagesToRemove, setPagesToRemove] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.15);
  const [addTextContent, setAddTextContent] = useState("");
  const [pageNumberPosition, setPageNumberPosition] = useState<
    "bottom-center" | "bottom-right" | "bottom-left"
  >("bottom-center");
  const [pageNumberStart, setPageNumberStart] = useState(1);
  const [cropTop, setCropTop] = useState(50);
  const [cropRight, setCropRight] = useState(50);
  const [cropBottom, setCropBottom] = useState(50);
  const [cropLeft, setCropLeft] = useState(50);
  const [organizeOrder, setOrganizeOrder] = useState("");
  const [cropApplyMode, setCropApplyMode] = useState<"all" | "current">("all");
  const [splitSelectedPages, setSplitSelectedPages] = useState<Set<number>>(new Set());
  const [removeSelectedPages, setRemoveSelectedPages] = useState<Set<number>>(new Set());
  const [visualPageCount, setVisualPageCount] = useState<number | null>(null);

  // Convert Set to range string (e.g. {1,2,3,5,7} => "1-3, 5, 7")
  const setToRangeString = useCallback((pages: Set<number>): string => {
    if (pages.size === 0) return "";
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0], end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = end = sorted[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(", ");
  }, []);

  useEffect(() => {
    const opts: ToolOptionsType = {};

    switch (slug) {
      case "split-pdf":
        opts.splitMode = splitMode;
        if (splitMode === "range" && file && splitSelectedPages.size > 0) {
          opts.splitRange = setToRangeString(splitSelectedPages);
        } else {
          opts.splitRange = splitRange;
        }
        break;
      case "rotate-pdf":
        opts.rotateAngle = rotateAngle;
        opts.rotateFilter = rotateFilter;
        break;
      case "remove-pages":
        if (file && removeSelectedPages.size > 0) {
          opts.pagesToRemove = setToRangeString(removeSelectedPages);
        } else {
          opts.pagesToRemove = pagesToRemove;
        }
        break;
      case "add-watermark":
        opts.watermarkText = watermarkText;
        opts.watermarkOpacity = watermarkOpacity;
        break;
      case "add-text":
        opts.addTextContent = addTextContent;
        break;
      case "page-numbers":
        opts.pageNumberPosition = pageNumberPosition;
        opts.pageNumberStart = pageNumberStart;
        break;
      case "crop-pdf":
        opts.cropMargins = {
          top: cropTop,
          right: cropRight,
          bottom: cropBottom,
          left: cropLeft,
        };
        break;
      case "organize-pages":
        opts.organizeOrder = organizeOrder;
        break;
    }

    onChange(opts);
  }, [
    slug, splitMode, splitRange, rotateAngle, rotateFilter, pagesToRemove,
    watermarkText, watermarkOpacity, addTextContent,
    pageNumberPosition, pageNumberStart,
    cropTop, cropRight, cropBottom, cropLeft, organizeOrder,
    splitSelectedPages, removeSelectedPages, setToRangeString, file,
  ]);

  const inputClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "block text-sm font-medium text-foreground mb-1";
  const selectClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  const panel = (children: React.ReactNode) => (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground mb-2">Options</h3>
      {pageCount !== null && (
        <p className="text-xs text-muted-foreground">
          Document has {pageCount} page{pageCount !== 1 ? "s" : ""}
        </p>
      )}
      {children}
    </div>
  );

  switch (slug) {
    case "split-pdf":
      return (
        <>
          {panel(
            <div>
              <label className={labelClass}>Split mode</label>
              <select
                value={splitMode}
                onChange={(e) => setSplitMode(e.target.value as "all" | "range")}
                className={selectClass}
              >
                <option value="all">Each page as separate PDF</option>
                <option value="range">Extract page range</option>
              </select>
            </div>
          )}
          {splitMode === "range" && file && (
            <PdfPageSelector
              file={file}
              mode="select"
              selectedPages={splitSelectedPages}
              onSelectionChange={(pages: Set<number>) => {
                setSplitSelectedPages(pages);
                setSplitRange(setToRangeString(pages));
              }}
              totalPages={visualPageCount}
              onTotalPagesLoaded={setVisualPageCount}
            />
          )}
          {splitMode === "range" && !file && (
            <div className="mt-4">
              <label className={labelClass}>Page range (e.g. 1-3, 5, 7-9)</label>
              <input
                type="text"
                value={splitRange}
                onChange={(e) => setSplitRange(e.target.value)}
                className={inputClass}
                placeholder="1-3, 5, 7-9"
              />
            </div>
          )}
        </>
      );

    case "rotate-pdf":
      return panel(
        <>
          {/* Orientation filter */}
          <div>
            <label className={labelClass}>Select pages to rotate</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { value: "all", label: "All", icon: "⊞" },
                { value: "portrait", label: "Portrait", icon: "▯" },
                { value: "landscape", label: "Landscape", icon: "▭" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRotateFilter(opt.value as any)}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 text-xs font-medium transition-colors ${
                    rotateFilter === opt.value
                      ? "border-primary text-primary bg-primary/5"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation direction */}
          <div>
            <label className={labelClass}>Rotation</label>
            <div className="space-y-2 mt-1">
              {[
                { value: 90, label: "RIGHT", desc: "90° clockwise", icon: "↻" },
                { value: 270, label: "LEFT", desc: "90° counter-clockwise", icon: "↺" },
                { value: 180, label: "FLIP", desc: "180° upside down", icon: "⇅" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRotateAngle(opt.value)}
                  className={`flex items-center gap-3 w-full rounded-lg border-2 px-4 py-3 transition-colors ${
                    rotateAngle === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ${
                    rotateAngle === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {opt.icon}
                  </span>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${rotateAngle === opt.value ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => { setRotateAngle(90); setRotateFilter("all"); }}
            className="text-xs text-primary hover:underline font-medium"
          >
            Reset all
          </button>
        </>
      );

    case "remove-pages":
      return (
        <>
          {panel(
            <p className="text-xs text-muted-foreground">
              Click pages below to mark them for removal.
            </p>
          )}
          {file ? (
            <PdfPageSelector
              file={file}
              mode="remove"
              selectedPages={removeSelectedPages}
              onSelectionChange={(pages: Set<number>) => {
                setRemoveSelectedPages(pages);
                setPagesToRemove(setToRangeString(pages));
              }}
              totalPages={visualPageCount}
              onTotalPagesLoaded={setVisualPageCount}
            />
          ) : (
            <div className="mt-4">
              <label className={labelClass}>Pages to remove (e.g. 1, 3, 5-7)</label>
              <input
                type="text"
                value={pagesToRemove}
                onChange={(e) => setPagesToRemove(e.target.value)}
                className={inputClass}
                placeholder="1, 3, 5-7"
              />
            </div>
          )}
        </>
      );

    case "add-watermark":
      return panel(
        <>
          <div>
            <label className={labelClass}>Watermark text</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className={inputClass}
              placeholder="CONFIDENTIAL"
            />
          </div>
          <div>
            <label className={labelClass}>
              Opacity: {Math.round(watermarkOpacity * 100)}%
            </label>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.05}
              value={watermarkOpacity}
              onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </>
      );

    case "add-text":
      return panel(
        <div>
          <label className={labelClass}>Text to add (first page)</label>
          <input
            type="text"
            value={addTextContent}
            onChange={(e) => setAddTextContent(e.target.value)}
            className={inputClass}
            placeholder="Enter text here..."
          />
        </div>
      );

    case "page-numbers":
      return panel(
        <>
          <div>
            <label className={labelClass}>Position</label>
            <select
              value={pageNumberPosition}
              onChange={(e) =>
                setPageNumberPosition(
                  e.target.value as "bottom-center" | "bottom-right" | "bottom-left"
                )
              }
              className={selectClass}
            >
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Start number</label>
            <input
              type="number"
              min={1}
              value={pageNumberStart}
              onChange={(e) => setPageNumberStart(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </>
      );

    case "crop-pdf":
      if (file) {
        return (
          <PdfCropPreview
            file={file}
            cropMode={cropApplyMode}
            onCropModeChange={setCropApplyMode}
            onCropChange={(margins: { top: number; right: number; bottom: number; left: number }) => {
              setCropTop(margins.top);
              setCropRight(margins.right);
              setCropBottom(margins.bottom);
              setCropLeft(margins.left);
            }}
            onProcess={onProcess || (() => {})}
            onReset={onReset || (() => {})}
            processing={parentProcessing || false}
            done={parentDone || false}
          />
        );
      }
      return panel(
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Top (pt)", val: cropTop, set: setCropTop },
            { label: "Right (pt)", val: cropRight, set: setCropRight },
            { label: "Bottom (pt)", val: cropBottom, set: setCropBottom },
            { label: "Left (pt)", val: cropLeft, set: setCropLeft },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input
                type="number"
                min={0}
                value={val}
                onChange={(e) => set(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      );

    case "organize-pages":
      return panel(
        <div>
          <label className={labelClass}>
            New page order (e.g. 3, 1, 2, 4)
          </label>
          <input
            type="text"
            value={organizeOrder}
            onChange={(e) => setOrganizeOrder(e.target.value)}
            className={inputClass}
            placeholder="3, 1, 2, 4"
          />
        </div>
      );

    default:
      return null;
  }
};

export default ToolOptionsPanel;
