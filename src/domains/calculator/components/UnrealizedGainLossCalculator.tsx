"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function UnrealizedGainLossCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("1000");
  const [currentValue, setCurrentValue] = useState("1200");
  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => {
    const purchase = parseFloat(purchasePrice) || 0;
    const current = parseFloat(currentValue) || 0;
    const gain = current - purchase;
    const gainPct = purchase > 0 ? (gain / purchase) * 100 : 0;
    const toBreakeven = gain !== 0 ? Math.abs(gain) : 0;
    const breakevenPct = current > 0 ? (toBreakeven / current) * 100 : 0;

    return { gain, gainPct, current, costBasis: purchase, breakevenPct };
  }, [purchasePrice, currentValue]);

  const chartData = [
    { name: "Cost Basis", value: result.costBasis },
    { name: "Current Value", value: result.current },
  ];

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="racira-page-container py-4">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Finance", href: "/finance" },
          {
            label: "Unrealized Gain/Loss Calculator",
            href: "/calculator/unrealized-gainloss-calculator",
          },
        ]}
      />

        {/* LEFT: inputs (Mortgage Calculator template) */}
        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Holding Details</h2>
          <p className="text-sm text-muted-foreground">Enter what you paid and what the position is worth now.</p>
          <div className="contents">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ug-purchase">Purchase price / cost basis ($)</Label>
              <Input
                id="ug-purchase"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ug-current">Current value ($)</Label>
              <Input
                id="ug-current"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                min={0}
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleCalculate}>Calculate</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPurchasePrice("1000");
                setCurrentValue("1200");
                setShowResults(false);
              }}
            >
              Reset
            </Button>
          </div>
        
          </div>
        </div>

        {/* RIGHT: results + content */}
        <div className="flex flex-col gap-4">

      {showResults && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="bg-primary/10 border-l-4 border-primary rounded-xl">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Unrealized gain / loss</p>
                <p
                  className={`text-2xl font-bold ${result.gain >= 0 ? "text-primary" : "text-red-500"}`}
                >
                  {result.gain > 0 ? "+" : ""}
                  {fmt(result.gain)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.gain >= 0 ? "Paper gain" : "Paper loss"} — not yet realized
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Return vs. cost</p>
                <p
                  className={`text-2xl font-bold ${result.gainPct >= 0 ? "" : "text-red-500"}`}
                >
                  {result.gainPct > 0 ? "+" : ""}
                  {result.gainPct.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Gain ÷ cost basis</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">To break even from here</p>
                <p className="text-2xl font-bold">
                  {result.gain < 0 ? `${result.breakevenPct.toFixed(1)}% gain` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.gain < 0 ? "Needed move from current value" : "Already in profit"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Basis vs. Current Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                      <Tooltip formatter={(v) => fmt(Number(v))} />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        name="Amount"
                        fill={result.gain >= 0 ? "#10b981" : "#ef4444"}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Cost basis</TableCell>
                      <TableCell className="text-right">{fmt(result.costBasis)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Current value</TableCell>
                      <TableCell className="text-right">{fmt(result.current)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Move needed to break even (from current)</TableCell>
                      <TableCell className="text-right">
                        {result.gain < 0
                          ? `${result.breakevenPct.toFixed(1)}% gain`
                          : "Already in profit"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                A holding bought at $1,000 now worth $1,200 is up $200 — a 20% paper gain. It
                becomes realized (and taxable) only when you sell. Capital gains are taxed at
                0/15/20% for most long-term holdings; a loss can offset other gains, which is the
                idea behind tax-loss harvesting.
              </p>
              <p>
                Note that a loss needs a <em>larger</em> percentage move to recover: a 20% loss
                requires a 25% gain to get back to breakeven, because the base is smaller.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">When does an unrealized gain become taxable?</p>
                <p className="text-muted-foreground">
                  When you sell (or otherwise dispose of) the asset — that is when the gain is
                  "realized" and, unless it qualifies for an exemption, reported on your tax
                  return.
                </p>
              </div>
              <div>
                <p className="font-semibold">Should I sell to lock in a gain?</p>
                <p className="text-muted-foreground">
                  Not automatically — the decision depends on your target allocation, tax
                  situation, and conviction. Selling creates a taxable event; holding defers the
                  tax but keeps the market risk.
                </p>
              </div>
              <div>
                <p className="font-semibold">What is tax-loss harvesting?</p>
                <p className="text-muted-foreground">
                  Selling a losing position to realize the loss, which offsets capital gains
                  (up to $3,000 of ordinary income per year), then reinvesting in a similar but
                  not identical asset to stay invested.
                </p>
              </div>
              <div>
                <p className="font-semibold">Does cost basis include fees?</p>
                <p className="text-muted-foreground">
                  Yes — commissions and other purchase costs are added to your cost basis, which
                  reduces the taxable gain when you eventually sell.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <Link href="/finance" className="text-primary hover:underline">
              ← More Finance Calculators
            </Link>
          </div>
        </>
      )}
        </div>
    </div>
  );
}
