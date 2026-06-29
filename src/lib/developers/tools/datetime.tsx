import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect } from "@/components/developers/tools/options-controls";

const unixTimestampConverter: ToolDefinition = {
  slug: "unix-timestamp-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.unit ?? "s")} onChange={(v) => setOptions({ ...options, unit: v })} options={[{ value: "s", label: "Seconds" }, { value: "ms", label: "Milliseconds" }]} />
    </OptionsBar>
  ),
  defaultOptions: { unit: "s" },
  transform: ({ input, options }) => {
    const unit = String(options.unit ?? "s");
    const trimmed = input.trim();
    let date: Date;
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      date = new Date(unit === "s" ? n * 1000 : n);
    } else if (!trimmed) {
      date = new Date();
    } else {
      date = new Date(trimmed);
    }
    if (isNaN(date.getTime())) throw new Error("Could not parse a timestamp or date");
    const ms = date.getTime();
    const lines = [
      `Input:        ${trimmed || "(now)"}`,
      `ISO 8601:     ${date.toISOString()}`,
      `UTC:          ${date.toUTCString()}`,
      `Local:        ${date.toString()}`,
      `Unix (s):     ${Math.floor(ms / 1000)}`,
      `Unix (ms):    ${ms}`,
      `Relative:     ${relativeFromNow(date)}`,
    ];
    return { output: lines.join("\n") };
  },
};

function relativeFromNow(date: Date): string {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const s = Math.floor(abs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const future = diff > 0;
  let str = "";
  if (d > 30) str = `${Math.floor(d / 30)} months`;
  else if (d > 0) str = `${d} days`;
  else if (h > 0) str = `${h} hours`;
  else if (m > 0) str = `${m} minutes`;
  else str = `${s} seconds`;
  return future ? `in ${str}` : `${str} ago`;
}

const isoDateFormatter: ToolDefinition = {
  slug: "iso-date-formatter",
  mode: "text",
  transform: ({ input }) => {
    const date = new Date(input.trim() || Date.now());
    if (isNaN(date.getTime())) throw new Error("Invalid date");
    const lines = [
      `ISO:         ${date.toISOString()}`,
      `Date only:   ${date.toISOString().slice(0, 10)}`,
      `Time only:   ${date.toISOString().slice(11, 19)}`,
      `RFC 7231:    ${date.toUTCString()}`,
      `Filename:    ${date.toISOString().slice(0, 19).replace(/[:T]/g, "-")}`,
    ];
    return { output: lines.join("\n") };
  },
};

const relativeTimeGenerator: ToolDefinition = {
  slug: "relative-time-generator",
  mode: "text",
  transform: ({ input }) => {
    const date = new Date(input.trim() || Date.now());
    if (isNaN(date.getTime())) throw new Error("Invalid date");
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diff = date.getTime() - Date.now();
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ["year", diff / (365 * 86400 * 1000)],
      ["month", diff / (30 * 86400 * 1000)],
      ["day", diff / 86400000],
      ["hour", diff / 3600000],
      ["minute", diff / 60000],
      ["second", diff / 1000],
    ];
    const out = units.map(([u, v]) => `${rtf.format(Math.round(v), u)}`).join("\n");
    return { output: out };
  },
};

const timezoneConverter: ToolDefinition = {
  slug: "timezone-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Timezone"><input defaultValue={String(options.tz ?? "UTC")} onChange={(e) => setOptions({ ...options, tz: e.target.value })} className="h-8 w-48 rounded-md border border-input bg-background px-2 text-sm" placeholder="America/New_York" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { tz: "UTC" },
  transform: ({ input, options }) => {
    const date = new Date(input.trim() || Date.now());
    if (isNaN(date.getTime())) throw new Error("Invalid date");
    const tz = String(options.tz ?? "UTC");
    try {
      const local = date.toLocaleString("en-US", { timeZone: tz, timeZoneName: "short" });
      return { output: `UTC:           ${date.toISOString()}\n${tz.padEnd(14)} ${local}\nYour local:    ${date.toString()}` };
    } catch {
      throw new Error("Invalid timezone IANA name");
    }
  },
};

const cronExpressionBuilder: ToolDefinition = {
  slug: "cron-expression-builder",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const f = (key: string, label: string) => (
      <div className="flex items-center gap-2">
        <label className="text-xs w-24 text-muted-foreground">{label}</label>
        <input defaultValue={String((options as Record<string, string>)[key] ?? "*")} onChange={(e) => setOptions({ ...options, [key]: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 font-mono text-sm" />
      </div>
    );
    const expr = `${options.min ?? "*"} ${options.hour ?? "*"} ${options.dom ?? "*"} ${options.mon ?? "*"} ${options.dow ?? "*"}`;
    return (
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <div className="grid sm:grid-cols-2 gap-2">
          {f("min", "Minute (0-59)")}
          {f("hour", "Hour (0-23)")}
          {f("dom", "Day of month")}
          {f("mon", "Month (1-12)")}
          {f("dow", "Day of week (0-6)")}
        </div>
        <div className="mt-3 p-3 rounded-md bg-muted font-mono text-sm break-all">{expr}</div>
        <div className="text-xs text-muted-foreground">{describeCron(expr)}</div>
      </div>
    );
  },
};

function describeCron(expr: string): string {
  const [m, h, dom, mon, dow] = expr.split(/\s+/);
  const parts: string[] = [];
  if (m !== "*") parts.push(`at minute ${m}`);
  if (h !== "*") parts.push(`at hour ${h}`);
  if (dom !== "*") parts.push(`on day ${dom} of the month`);
  if (mon !== "*") parts.push(`in month ${mon}`);
  if (dow !== "*") parts.push(`on day-of-week ${dow}`);
  return parts.length ? `Runs ${parts.join(", ")}.` : "Runs every minute.";
}

export const datetimeTools: ToolDefinition[] = [
  unixTimestampConverter, isoDateFormatter, relativeTimeGenerator, timezoneConverter,
  cronExpressionBuilder,
];
