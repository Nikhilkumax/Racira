"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer, Copy, Check, AlertCircle } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  pattern: string
  flags: string
  testString: string
}

interface MatchInfo {
  index: number
  fullMatch: string
  groups: string[]
  start: number
  end: number
}

interface Result {
  matchCount: number
  matches: MatchInfo[]
  totalGroupCount: number
  charsMatched: number
  error: string | null
}

const DEFAULTS: Inputs = {
  pattern: "([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})",
  flags: "g",
  testString: "My email is hello@example.com and support@racira.org",
}

function calculate(inputs: Inputs): Result {
  if (!inputs.pattern.trim()) {
    return { matchCount: 0, matches: [], totalGroupCount: 0, charsMatched: 0, error: null }
  }
  try {
    const regex = new RegExp(inputs.pattern, inputs.flags)
    const raw = Array.from(inputs.testString.matchAll(regex))
    const matches: MatchInfo[] = raw.map((match, idx) => ({
      index: idx,
      fullMatch: match[0],
      groups: match.slice(1),
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    }))
    const totalGroupCount = matches.reduce((s, m) => s + m.groups.length, 0)
    const charsMatched = matches.reduce((s, m) => s + m.fullMatch.length, 0)
    return { matchCount: matches.length, matches, totalGroupCount, charsMatched, error: null }
  } catch (err) {
    return {
      matchCount: 0,
      matches: [],
      totalGroupCount: 0,
      charsMatched: 0,
      error: err instanceof Error ? err.message : "Invalid regular expression",
    }
  }
}

export default function RegexTestCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = result.error !== null

  const chartData = useMemo(
    () =>
      result.matches.map((m) => ({
        name: `#${m.index + 1}`,
        position: m.start,
        length: m.fullMatch.length,
        isHighlight: true,
      })),
    [result]
  )

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  function copyPattern() {
    navigator.clipboard.writeText(`/${inputs.pattern}/${inputs.flags}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Regex Match Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Regex Match Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Regex Pattern</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
                    <input
                      type="text"
                      value={inputs.pattern}
                      onChange={(e) => setInputs({ ...inputs, pattern: e.target.value })}
                      className={`w-full h-10 text-base rounded-md border ${invalid ? "border-red-500 bg-red-500/5" : "border-input bg-background"} pl-7 pr-8 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="e.g. ^[a-z]+$"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</span>
                  </div>
                  <input
                    type="text"
                    value={inputs.flags}
                    onChange={(e) => setInputs({ ...inputs, flags: e.target.value })}
                    className="w-20 h-10 text-base rounded-md border border-input bg-background px-2 font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="flags"
                  />
                  <button
                    type="button"
                    onClick={copyPattern}
                    aria-label="Copy pattern"
                    className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {invalid && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {result.error}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Test String</label>
                <textarea
                  value={inputs.testString}
                  onChange={(e) => setInputs({ ...inputs, testString: e.target.value })}
                  className="w-full min-h-[110px] text-base rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter text to search..."
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                onClick={run}
                disabled={invalid}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="flex flex-col gap-4 print-section">
          {/* 1. PRIMARY RESULT CARD */}
          <div className="relative bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print"
              className="absolute top-3 right-3 h-8 w-8 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center"
            >
              <Printer className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Matches</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.matchCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.matchCount > 0
                ? `${result.charsMatched} characters matched across the test string`
                : invalid
                ? "Pattern is invalid — fix the regex"
                : "No matches found with the current pattern"}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Capture Groups</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.totalGroupCount}</p>
              <p className="text-xs text-muted-foreground">across all matches</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <p className={`text-lg font-bold mt-1 ${result.matchCount > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                {result.matchCount > 0 ? "Match" : "No Match"}
              </p>
              <p className="text-xs text-muted-foreground">{invalid ? "error" : "pattern applied"}</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Test String</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{inputs.testString.length}</p>
              <p className="text-xs text-muted-foreground">characters</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Captured Matches & Groups</h2>
            {result.matches.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                {invalid ? "Fix the regex to see results." : "No matches found with current pattern."}
              </p>
            ) : (
              <div className="max-h-[260px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                      <th className="text-left py-2 px-3 font-medium">Match</th>
                      <th className="text-left py-2 px-3 font-medium">Position</th>
                      <th className="text-left py-2 px-3 font-medium">Captured Text</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.matches.map((m) => (
                      <tr key={m.index} className="border-b border-border">
                        <td className="py-2.5 px-3 font-semibold text-primary">#{m.index + 1}</td>
                        <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{m.start}–{m.end}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-mono text-xs break-all bg-secondary/40 rounded px-2 py-1">{m.fullMatch}</p>
                          {m.groups.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {m.groups.map((g, gIdx) => (
                                <p key={gIdx} className="text-xs text-muted-foreground font-mono">
                                  <span className="text-muted-foreground">G{gIdx + 1}:</span> {g || "null"}
                                </p>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Match Positions in Test String</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: "char index", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fontSize: 10 } }} />
                <Tooltip
                  formatter={(v: number, name: string) => [v, name === "position" ? "Start index" : "Length"]}
                />
                <Bar dataKey="position" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.45)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {chartData.length > 0
                ? `${chartData.length} match(es) · first match at character ${chartData[0]?.position ?? "—"}`
                : "Bar appears once matches are found."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Matches Found</p>
                <p className="font-semibold text-foreground">{result.matchCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Characters Matched</p>
                <p className="font-semibold text-foreground">{result.charsMatched}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Capture Groups</p>
                <p className="font-semibold text-foreground">{result.totalGroupCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pattern Length</p>
                <p className="font-semibold text-foreground">{inputs.pattern.length} chars</p>
              </div>
              <div>
                <p className="text-muted-foreground">Flags</p>
                <p className="font-semibold text-foreground font-mono">/{inputs.flags || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Test String</p>
                <p className="font-semibold text-foreground">{inputs.testString.length} chars</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/regex-test-calculator" />
      </div>
    </div>
  )
}
