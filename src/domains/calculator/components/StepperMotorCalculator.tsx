"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  stepAngle: string
  microstepping: string
  beltPitch: string
  pulleyTeeth: string
  screwLead: string
}

interface Result {
  fullStepsPerRev: number
  microstepsPerRev: number
  beltStepsPerMm: number
  screwStepsPerMm: number
  beltResUm: number
  screwResUm: number
}

const DEFAULTS: Inputs = {
  stepAngle: "1.8",
  microstepping: "16",
  beltPitch: "2",
  pulleyTeeth: "20",
  screwLead: "8",
}

const MICROSTEP_OPTIONS = ["1", "2", "4", "8", "16", "32", "64", "128", "256"]

function calculate(inputs: Inputs): Result {
  const angle = parseFloat(inputs.stepAngle) || 1.8
  const ms = parseFloat(inputs.microstepping) || 16
  const pitch = parseFloat(inputs.beltPitch) || 2
  const teeth = parseFloat(inputs.pulleyTeeth) || 20
  const lsPitch = parseFloat(inputs.screwLead) || 8

  const fullStepsPerRev = 360 / angle
  const microstepsPerRev = fullStepsPerRev * ms
  const beltStepsPerMm = microstepsPerRev / (pitch * teeth)
  const screwStepsPerMm = microstepsPerRev / lsPitch

  return {
    fullStepsPerRev,
    microstepsPerRev,
    beltStepsPerMm,
    screwStepsPerMm,
    beltResUm: (1 / beltStepsPerMm) * 1000,
    screwResUm: (1 / screwStepsPerMm) * 1000,
  }
}

export default function StepperMotorCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const angle = parseFloat(inputs.stepAngle)
    const pitch = parseFloat(inputs.beltPitch)
    const teeth = parseFloat(inputs.pulleyTeeth)
    const screw = parseFloat(inputs.screwLead)
    return [angle, pitch, teeth, screw].some((v) => isNaN(v) || v <= 0)
  }, [inputs])

  const chartData = useMemo(() => {
    const angle = parseFloat(inputs.stepAngle) || 1.8
    const pitch = parseFloat(inputs.beltPitch) || 2
    const teeth = parseFloat(inputs.pulleyTeeth) || 20
    return MICROSTEP_OPTIONS.map((ms, i) => {
      const full = 360 / angle
      const steps = (full * parseFloat(ms)) / (pitch * teeth)
      return {
        name: `${ms}x`,
        steps: parseFloat(steps.toFixed(2)),
        isSel: ms === inputs.microstepping,
        isLast: i === MICROSTEP_OPTIONS.length - 1,
      }
    })
  }, [inputs])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Stepper Motor Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Stepper Motor Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Step Angle (°)</label>
                <select
                  value={inputs.stepAngle}
                  onChange={(e) => setInputs({ ...inputs, stepAngle: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1.8">1.8° (200 steps)</option>
                  <option value="0.9">0.9° (400 steps)</option>
                  <option value="7.5">7.5° (48 steps)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Microstepping</label>
                <select
                  value={inputs.microstepping}
                  onChange={(e) => setInputs({ ...inputs, microstepping: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {MICROSTEP_OPTIONS.map((ms) => (
                    <option key={ms} value={ms}>{ms}× {ms === "1" ? "(Full)" : ms === "2" ? "(Half)" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Belt Pitch (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.beltPitch}
                  onChange={(e) => setInputs({ ...inputs, beltPitch: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pulley Teeth</label>
                <input
                  type="number"
                  value={inputs.pulleyTeeth}
                  onChange={(e) => setInputs({ ...inputs, pulleyTeeth: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Screw Lead (mm/rev)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.screwLead}
                  onChange={(e) => setInputs({ ...inputs, screwLead: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="8"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter positive values for pitch, teeth, screw lead, and a valid step angle.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Belt Drive Steps/mm</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.beltStepsPerMm.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              M92 X{result.beltStepsPerMm.toFixed(2)} Y{result.beltStepsPerMm.toFixed(2)}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Full Steps/Rev</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.fullStepsPerRev}</p>
              <p className="text-xs text-muted-foreground">360° ÷ {inputs.stepAngle}°</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Microsteps/Rev</p>
              <p className="text-lg font-bold text-primary mt-1">{result.microstepsPerRev.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">at {inputs.microstepping}×</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Screw Steps/mm</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{result.screwStepsPerMm.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground font-mono">M92 Z{result.screwStepsPerMm.toFixed(2)}</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Resolution Data</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Steps Per Revolution", `${result.fullStepsPerRev}`],
                  ["Microsteps Per Revolution", result.microstepsPerRev.toLocaleString()],
                  ["Belt Drive Steps/mm", result.beltStepsPerMm.toFixed(2), "M92 X/Y"],
                  ["Linear Resolution (Belt)", `${result.beltResUm.toFixed(2)} μm/step`],
                  ["Screw Steps/mm", result.screwStepsPerMm.toFixed(2), "M92 Z"],
                  ["Linear Resolution (Screw)", `${result.screwResUm.toFixed(2)} μm/step`],
                ].map((row, i) => (
                  <tr key={row[0]} className={`border-b border-border ${i === 2 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0]}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row[1]}</td>
                    {row[2] && <td className="py-2.5 px-3 text-right text-muted-foreground font-mono text-xs">{row[2]}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Belt Steps/mm vs Microstepping</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v} steps/mm`, "Resolution"]} labelFormatter={(l) => `${l} microstepping`} />
                <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.isSel ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Higher microstepping increases firmware steps but doesn't always improve real accuracy beyond ~16×.
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Step Angle</p>
                <p className="font-semibold text-foreground">{inputs.stepAngle}° ({result.fullStepsPerRev} steps/rev)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Microstepping</p>
                <p className="font-semibold text-foreground">{inputs.microstepping}×</p>
              </div>
              <div>
                <p className="text-muted-foreground">Belt Steps/mm</p>
                <p className="font-semibold text-foreground">{result.beltStepsPerMm.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Screw Steps/mm</p>
                <p className="font-semibold text-foreground">{result.screwStepsPerMm.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Belt Resolution</p>
                <p className="font-semibold text-foreground">{result.beltResUm.toFixed(2)} μm/step</p>
              </div>
              <div>
                <p className="text-muted-foreground">Screw Resolution</p>
                <p className="font-semibold text-foreground">{result.screwResUm.toFixed(2)} μm/step</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/stepper-motor-calculator" />
      </div>
    </div>
  )
}
