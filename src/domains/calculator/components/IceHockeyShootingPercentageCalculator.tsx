"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  goals: string
  shots: string
}

interface Result {
  pct: number
  perGame: number
  leagueAvg: number
  vsLeague: number
  label: string
}

const LEAGUE_AVG = 9.3

const DEFAULTS: Inputs = { goals: "12", shots: "80" }

function calculate(inputs: Inputs): Result {
  const goals = parseFloat(inputs.goals) || 0
  const shots = parseFloat(inputs.shots) || 0
  const pct = shots > 0 ? (goals / shots) * 100 : 0
  const vsLeague = pct - LEAGUE_AVG
  return {
    pct,
    perGame: shots > 0 ? goals / shots : 0,
    leagueAvg: LEAGUE_AVG,
    vsLeague,
    label:
      pct >= 12 ? "Elite" : pct >= LEAGUE_AVG ? "Above Average" : pct > 0 ? "Below Average" : "—",
  }
}

export default function IceHockeyShootingPercentageCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const g = parseFloat(inputs.goals)
    const s = parseFloat(inputs.shots)
    return isNaN(g) || g < 0 || isNaN(s) || s <= 0
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Your Shooting %", value: result.pct, fill: "hsl(var(--primary))" },
      { name: "NHL Average", value: LEAGUE_AVG, fill: "hsl(var(--primary) / 0.4)" },
    ],
    [result]
  )

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  return (
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Health</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Ice Hockey Shooting Percentage Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Ice Hockey Shooting Percentage Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Goals Scored</label>
                <input
                  type="number"
                  value={inputs.goals}
                  onChange={(e) => setInputs({ ...inputs, goals: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shots on Goal</label>
                <input
                  type="number"
                  value={inputs.shots}
                  onChange={(e) => setInputs({ ...inputs, shots: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="80"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative goals and a shot total greater than zero.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Shooting Percentage</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.pct.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {parseFloat(inputs.goals) || 0} goals on {parseFloat(inputs.shots) || 0} shots
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Goals per Shot</p>
              <p className="text-lg font-bold mt-1 text-primary">{result.perGame.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">scoring efficiency</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">NHL Average</p>
              <p className="text-lg font-bold mt-1">{LEAGUE_AVG.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">league benchmark</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">vs League</p>
              <p className={`text-lg font-bold mt-1 ${result.vsLeague >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {result.vsLeague >= 0 ? "+" : ""}
                {result.vsLeague.toFixed(1)} pp
              </p>
              <p className="text-xs text-muted-foreground">{result.label}</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Shot Breakdown</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Goals Scored", parseFloat(inputs.goals) || 0, "total goals"],
                  ["Shots on Goal", parseFloat(inputs.shots) || 0, "total attempts"],
                  ["Goals per Shot", result.perGame, "ratio"],
                  ["Shooting Percentage", result.pct, "goals ÷ shots"],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 3 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {i === 3 ? `${result.pct.toFixed(1)}%` : (row[1] as number).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Shooting Percentage Comparison (%)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.pct > 0
                ? `You score on ${result.pct.toFixed(1)}% of shots — ${result.vsLeague >= 0 ? `${result.vsLeague.toFixed(1)} percentage points above` : `${Math.abs(result.vsLeague).toFixed(1)} percentage points below`} the NHL average of ${LEAGUE_AVG}%.`
                : "Enter shots greater than zero to compute shooting percentage."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Goals</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.goals) || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shots</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.shots) || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shooting Percentage</p>
                <p className="font-semibold text-foreground">{result.pct.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">NHL Average</p>
                <p className="font-semibold text-foreground">{LEAGUE_AVG.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">vs League</p>
                <p className="font-semibold text-foreground">
                  {result.vsLeague >= 0 ? "+" : ""}
                  {result.vsLeague.toFixed(1)} pp
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Rating</p>
                <p className="font-semibold text-foreground">{result.label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/ice-hockey-shooting-percentage-calculator" />
      </div>
    </div>
  )
}
