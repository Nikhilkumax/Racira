import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import type { Tool } from "@/domains/pdf/registry/tools";
import type { ToolOptions } from "@/lib/pdf/pdf-tools";

interface DefaultToolOptionsProps {
  tool: Tool;
  onChange?: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

/**
 * Fallback options panel for tools that don't have a custom panel yet.
 * Renders any registry-declared inputs (file, number, select, text) as
 * generic controls and pushes the full ToolOptions object via onChange.
 */
const DefaultToolOptions = ({ tool, onChange, onProcess, onReset, processing }: DefaultToolOptionsProps) => {
  const Icon = tool.icon;
  const allInputs = tool.inputs ?? [];

  // Track all input values locally so onChange always receives the full set
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const input of allInputs) {
      if (input.default !== undefined) init[input.key] = input.default;
    }
    return init;
  });

  // Push the full options object whenever values change
  useEffect(() => {
    onChange?.(values as ToolOptions);
  }, [values]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (key: string, val: unknown) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleFileChange = async (key: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const buf = await fileList[0].arrayBuffer();
    update(key, buf);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">{tool.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
        </div>

        <div className="h-px bg-border" />

        {allInputs.length > 0 ? (
          <div className="space-y-4">
            {allInputs.map(input => {
              switch (input.type) {
                case "file":
                  return (
                    <label key={input.key} className="flex flex-col gap-1.5 cursor-pointer">
                      <span className="text-sm font-medium text-foreground">{input.label}</span>
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 hover:bg-muted/60 transition-colors">
                        <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {values[input.key] ? "File selected ✓" : "Click to select a file"}
                        </span>
                        <input
                          type="file"
                          accept={input.accept}
                          className="sr-only"
                          onChange={(e) => handleFileChange(input.key, e.target.files)}
                        />
                      </div>
                    </label>
                  );
                case "number":
                  return (
                    <label key={input.key} className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-foreground">{input.label}</span>
                      <input
                        type="number"
                        min={input.min}
                        max={input.max}
                        value={values[input.key] ?? input.default ?? ""}
                        onChange={(e) => update(input.key, Number(e.target.value))}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  );
                case "select":
                  return (
                    <label key={input.key} className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-foreground">{input.label}</span>
                      <select
                        value={String(values[input.key] ?? input.default ?? "")}
                        onChange={(e) => update(input.key, e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        {input.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </label>
                  );
                case "text":
                  return (
                    <label key={input.key} className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-foreground">{input.label}</span>
                      <input
                        type="text"
                        placeholder={input.placeholder}
                        value={String(values[input.key] ?? "")}
                        onChange={(e) => update(input.key, e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  );
                default:
                  return null;
              }
            })}
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Upload your files and click the button below to process.
            </p>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Icon className="h-4 w-4" />
              Process {tool.name}
            </>
          )}
        </button>
        <button
          onClick={onReset}
          disabled={processing}
          className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default DefaultToolOptions;
