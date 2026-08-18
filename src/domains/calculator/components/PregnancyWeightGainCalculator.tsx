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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

export default function PregnancyWeightGainCalculator() {
  const [preWeight, setPreWeight] = useState("140");
  const [height, setHeight] = useState("65");
  const [currentWeight, setCurrentWeight] = useState("155");
  const [currentWeek, setCurrentWeek] = useState("20");
  const [twins, setTwins] = useState("no");

  function computeResult(preWeight: string, height: string, currentWeight: string, currentWeek: string, twins: string) {
    const preWt = parseFloat(preWeight) || 0;
    const ht = parseFloat(height) || 0;
    const curWt = parseFloat(currentWeight) || 0;
    const week = Math.max(0, Math.min(42, parseFloat(currentWeek) || 0));

    const bmi = ht > 0 ? (preWt / (ht * ht)) * 703 : 0;

    let totalGainMin = 0;
    let totalGainMax = 0;
    let weeklyGain = 1;
    let firstTriGain = 3;

    if (twins === "yes") {
      if (bmi < 18.5) {
        totalGainMin = 50;
        totalGainMax = 62;
      } else if (bmi < 25) {
        totalGainMin = 37;
        totalGainMax = 54;
      } else if (bmi < 30) {
        totalGainMin = 31;
        totalGainMax = 50;
      } else {
        totalGainMin = 25;
        totalGainMax = 42;
      }
      firstTriGain = 4;
      weeklyGain = 1.5;
    } else if (bmi < 18.5) {
      totalGainMin = 28;
      totalGainMax = 40;
      weeklyGain = 1;
      firstTriGain = 3;
    } else if (bmi < 25) {
      totalGainMin = 25;
      totalGainMax = 35;
      weeklyGain = 1;
      firstTriGain = 3;
    } else if (bmi < 30) {
      totalGainMin = 15;
      totalGainMax = 25;
      weeklyGain = 0.6;
      firstTriGain = 2;
    } else {
      totalGainMin = 11;
      totalGainMax = 20;
      weeklyGain = 0.5;
      firstTriGain = 1;
    }

    let expectedMin: number;
    let expectedMax: number;
    if (week <= 13) {
      expectedMin = (week / 13) * (firstTriGain - 1);
      expectedMax = (week / 13) * (firstTriGain + 2);
    } else {
      const past = week - 13;
      expectedMin = firstTriGain - 1 + past * (weeklyGain - 0.2);
      expectedMax = firstTriGain + 2 + past * (weeklyGain + 0.2);
    }

    const actualGain = curWt - preWt;
    let status = "On track";
    let tone: "emerald" | "amber" | "red" = "emerald";
    if (actualGain < expectedMin) {
      status = "Below expected";
      tone = "amber";
    } else if (actualGain > expectedMax) {
      status = "Above expected";
      tone = "red";
    }

    return {
      bmi,
      totalGainMin,
      totalGainMax,
      expectedMin,
      expectedMax,
      actualGain,
      status,
      tone,
      week,
    };
  }

  const [result, setResult] = useState<ReturnType<typeof computeResult>>(() => computeResult("140", "65", "155", "20", "no"));
  const handleCalculate = () => setResult(computeResult(preWeight, height, currentWeight, currentWeek, twins));

  const chartData = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((w) => {
    const r = computeResult(preWeight, height, currentWeight, String(w), twins);
    return { name: `Wk ${w}`, "Min gain": Number(r.expectedMin.toFixed(1)), "Max gain": Number(r.expectedMax.toFixed(1)) };
  });

  const toneClass =
    result.tone === "emerald"
      ? "text-emerald-600"
      : result.tone === "amber"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pregnancy Weight Gain Calculator</CardTitle>
        <CardDescription>
          Track your weight gain against ACOG guidelines based on pre-pregnancy
          BMI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pwg-pre">Pre-pregnancy weight (lbs)</Label>
            <Input
              id="pwg-pre"
              type="number"
              value={preWeight}
              onChange={(e) => setPreWeight(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwg-height">Height (inches)</Label>
            <Input
              id="pwg-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min={0}
              max={96}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwg-cur">Current weight (lbs)</Label>
            <Input
              id="pwg-cur"
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwg-week">Current week of pregnancy</Label>
            <Input
              id="pwg-week"
              type="number"
              value={currentWeek}
              onChange={(e) => setCurrentWeek(e.target.value)}
              min={1}
              max={42}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwg-twins">Carrying twins?</Label>
            <Select value={twins} onValueChange={setTwins}>
              <SelectTrigger id="pwg-twins">
                <SelectValue placeholder="Twins?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          <h3 className="font-medium">
            Weight gain at week {result.week} —{" "}
            <span className={toneClass}>{result.status}</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your gain so far</p>
              <p className="text-3xl font-bold">{result.actualGain.toFixed(1)} lbs</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected by now</p>
              <p className="text-3xl font-bold">
                {result.expectedMin.toFixed(1)} – {result.expectedMax.toFixed(1)} lbs
              </p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Pre-pregnancy BMI</TableCell>
                <TableCell className="text-right">{result.bmi.toFixed(1)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total recommended gain by week 40</TableCell>
                <TableCell className="text-right">
                  {result.totalGainMin} – {result.totalGainMax} lbs
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Expected Gain Trajectory</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip formatter={(value: number) => `${value} lbs`} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar dataKey="Min gain" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="Max gain" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3 italic">ACOG-expected cumulative gain band at each week for your BMI range.</p>
        </div>

        <div className="rounded-lg bg-primary/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">ACOG guidelines</p>
          <p className="mt-1">
            Normal-BMI women (18.5–24.9) should gain 25–35 lbs total — about
            1–4 lbs in the first trimester, then roughly 1 lb/week. Overweight
            (BMI 25–29.9) targets 15–25 lbs; obese, 11–20 lbs. Gaining too
            little risks low birth weight; too much raises the odds of
            gestational diabetes and delivery complications.
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
              setPreWeight("140");
              setHeight("65");
              setCurrentWeight("155");
              setCurrentWeek("20");
              setTwins("no");
              setResult(computeResult("140", "65", "155", "20", "no"));
            }}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
