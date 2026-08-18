"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

type Method = "lmp" | "ultrasound" | "ivf3" | "ivf5";

function todayStr(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PregnancyCalculator() {
  const [method, setMethod] = useState<Method>("lmp");
  const [referenceDate, setReferenceDate] = useState<string>(todayStr());

  function computeResult(method: Method, referenceDate: string) {
    if (!referenceDate) return null;
    const ref = new Date(referenceDate + "T12:00:00");
    if (isNaN(ref.getTime())) return null;

    let edd = new Date(ref);
    let conception = new Date(ref);

    if (method === "lmp") {
      edd.setDate(edd.getDate() + 280);
      conception.setDate(conception.getDate() + 14);
    } else if (method === "ultrasound") {
      conception = new Date(ref);
      conception.setDate(conception.getDate() - 266);
    } else if (method === "ivf3") {
      edd.setDate(edd.getDate() + 263);
      conception.setDate(conception.getDate() - 3);
    } else {
      edd.setDate(edd.getDate() + 261);
      conception.setDate(conception.getDate() - 5);
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const conceptualLmp = new Date(edd);
    conceptualLmp.setDate(conceptualLmp.getDate() - 280);

    const diffDays = Math.floor((today.getTime() - conceptualLmp.getTime()) / 86400000);
    let weeks = Math.floor(diffDays / 7);
    let days = diffDays % 7;
    if (diffDays < 0) {
      weeks = 0;
      days = 0;
    } else if (diffDays > 294) {
      weeks = 42;
      days = 0;
    }

    let trimester = 1;
    if (weeks >= 28) trimester = 3;
    else if (weeks >= 13) trimester = 2;

    const daysRemaining = Math.max(0, 280 - diffDays);
    const progressPct = Math.max(0, Math.min(100, (diffDays / 280) * 100));

    const milestoneAt = (w: number) => {
      const d = new Date(conceptualLmp);
      d.setDate(d.getDate() + w * 7);
      return d;
    };

    const milestones = [
      { label: "End of first trimester (13 weeks)", date: milestoneAt(13) },
      { label: "Anatomy scan (18–22 weeks)", date: milestoneAt(20) },
      { label: "Viability (24 weeks)", date: milestoneAt(24) },
      { label: "Third trimester begins (28 weeks)", date: milestoneAt(28) },
      { label: "Early term (37 weeks)", date: milestoneAt(37) },
      { label: "Estimated due date (40 weeks)", date: edd },
    ];

    return {
      estimatedDueDate: fmtDate(edd),
      conceptionDate: fmtDate(conception),
      weeks,
      days,
      trimester,
      daysRemaining,
      progressPct,
      milestones: milestones.map((m) => ({
        ...m,
        dateText: fmtDate(m.date),
        isPast: today > m.date,
      })),
    };
  }

  const [result, setResult] = useState<ReturnType<typeof computeResult>>(() => computeResult("lmp", todayStr()));
  const handleCalculate = () => setResult(computeResult(method, referenceDate));

  const weekVals = [13, 20, 24, 28, 37, 40];
  const chartData = (result?.milestones ?? []).map((m, i) => ({
    name: `Wk ${weekVals[i] ?? ""}`,
    week: weekVals[i] ?? 0,
    isPast: m.isPast,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pregnancy Calculator</CardTitle>
        <CardDescription>
          Estimate your due date, current gestational age, trimester, and
          milestone timeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pg-method">Calculation method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
              <SelectTrigger id="pg-method">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lmp">First day of last period (LMP)</SelectItem>
                <SelectItem value="ultrasound">Known due date (ultrasound)</SelectItem>
                <SelectItem value="ivf5">IVF transfer (5-day embryo)</SelectItem>
                <SelectItem value="ivf3">IVF transfer (3-day embryo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pg-date">
              {method === "lmp"
                ? "Date of last period"
                : method === "ultrasound"
                  ? "Estimated due date"
                  : "Date of embryo transfer"}
            </Label>
            <Input
              id="pg-date"
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
            />
          </div>
        </div>

        {result && (
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            <h3 className="font-medium">Estimated due date</h3>
            <p className="text-3xl font-bold text-primary">{result.estimatedDueDate}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Gestational age</p>
                <p className="text-2xl font-bold">
                  {result.weeks} wks {result.days} days
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trimester</p>
                <p className="text-2xl font-bold">Trimester {result.trimester}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 wks</span>
                <span>{result.daysRemaining} days remaining</span>
                <span>40 wks</span>
              </div>
              <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${result.progressPct}%` }}
                />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <h3 className="text-sm font-semibold mb-3">Pregnancy Milestones</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 42]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => `Week ${value}`} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                    <Bar dataKey="week" radius={[4, 4, 0, 0]} maxBarSize={45}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isPast ? "hsl(var(--muted-foreground)/0.35)" : "hsl(var(--primary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2 italic">Dimmer bars are milestones already passed.</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.milestones.map((m) => (
                  <TableRow key={m.label} className={m.isPast ? "opacity-60" : ""}>
                    <TableCell>
                      {m.label} {m.isPast && <span className="text-xs text-muted-foreground">(passed)</span>}
                    </TableCell>
                    <TableCell className="text-right">{m.dateText}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-sm text-muted-foreground">
              Conception date: <span className="font-medium text-foreground">{result.conceptionDate}</span>
            </p>
          </div>
        )}

        <div className="rounded-lg bg-primary/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">How the dates work</p>
          <p className="mt-1">
            Naegele&apos;s rule adds 280 days to the first day of your last period —
            conception is assumed two weeks in, so a 40-week pregnancy is 38
            weeks of fetal age. Ultrasound dating and IVF transfers are more
            precise because the start point is known. Only about 5% of babies
            arrive on their due date; full term spans 39 to 41 weeks.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            size="sm"
            onClick={handleCalculate}
          >
            Calculate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMethod("lmp");
              setReferenceDate(todayStr());
              setResult(computeResult("lmp", todayStr()));
            }}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
