"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export default function WorkingCapitalCalculator() {
  const [currentAssets, setCurrentAssets] = useState("150000");
  const [currentLiabilities, setCurrentLiabilities] = useState("60000");
  const [inventory, setInventory] = useState("30000");
  const [receivables, setReceivables] = useState("40000");
  const [payables, setPayables] = useState("20000");
  const [showResults, setShowResults] = useState(false);

  const ca = parseFloat(currentAssets) || 0;
  const cl = parseFloat(currentLiabilities) || 0;
  const inv = parseFloat(inventory) || 0;
  const recv = parseFloat(receivables) || 0;
  const pay = parseFloat(payables) || 0;

  const workingCapital = ca - cl;
  const currentRatio = cl > 0 ? ca / cl : 0;
  const quickAssets = ca - inv;
  const quickRatio = cl > 0 ? quickAssets / cl : 0;
  const cashRatio = cl > 0 ? (ca - inv - recv) / cl : 0;
  const netWorkingCapitalRatio = ca > 0 ? workingCapital / ca : 0;

  const pieData = [
    { name: "Cash & Equivalents", value: Math.max(ca - inv - recv, 0) },
    { name: "Inventory", value: inv },
    { name: "Receivables", value: recv },
    { name: "Other Assets", value: Math.max(ca - (ca - inv - recv) - inv - recv, 0) },
  ].filter((d) => d.value > 0);

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Business", href: "/business" },
          {
            label: "Working Capital Calculator",
            href: "/calculator/working-capital-calculator",
          },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Working Capital Calculator</h1>
        <p className="text-muted-foreground">
          See how much cash your business has to run day-to-day after covering short-term
          obligations — and how healthy your liquidity ratios are.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Assets &amp; Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ca">Total Current Assets</Label>
              <Input
                id="ca"
                type="number"
                value={currentAssets}
                onChange={(e) => setCurrentAssets(e.target.value)}
                placeholder="150000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cl">Total Current Liabilities</Label>
              <Input
                id="cl"
                type="number"
                value={currentLiabilities}
                onChange={(e) => setCurrentLiabilities(e.target.value)}
                placeholder="60000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv">Inventory</Label>
              <Input
                id="inv"
                type="number"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                placeholder="30000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recv">Accounts Receivable</Label>
              <Input
                id="recv"
                type="number"
                value={receivables}
                onChange={(e) => setReceivables(e.target.value)}
                placeholder="40000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay">Accounts Payable</Label>
              <Input
                id="pay"
                type="number"
                value={payables}
                onChange={(e) => setPayables(e.target.value)}
                placeholder="20000"
              />
            </div>
          </div>
          <Button onClick={handleCalculate} className="mt-6 w-full sm:w-auto">
            Calculate
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="border-l-4 border-primary">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Working Capital</p>
                <p className="text-2xl font-bold">
                  $
                  {workingCapital.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Assets − Liabilities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Current Ratio</p>
                <p className="text-2xl font-bold">{currentRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {currentRatio >= 1.5
                    ? "Healthy (≥1.5)"
                    : currentRatio >= 1
                      ? "Adequate (1.0–1.5)"
                      : "Concerning (<1.0)"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Quick Ratio</p>
                <p className="text-2xl font-bold">{quickRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {quickRatio >= 1 ? "Healthy (≥1.0)" : "Below 1.0 — relies on inventory"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Cash Ratio</p>
                <p className="text-2xl font-bold">{cashRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Cash-only coverage</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">NWC / Assets</p>
                <p className="text-2xl font-bold">{netWorkingCapitalRatio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {netWorkingCapitalRatio >= 0.25
                    ? "Strong buffer"
                    : netWorkingCapitalRatio >= 0
                      ? "Positive but thin"
                      : "Negative — shortfall"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Liquidity Health</p>
                <p className="text-2xl font-bold">
                  {currentRatio >= 1.5 && quickRatio >= 1
                    ? "Strong"
                    : currentRatio >= 1
                      ? "Stable"
                      : "At Risk"}
                </p>
                <p className="text-xs text-muted-foreground">Combined ratios view</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Current Asset Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                      }
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Working Capital = Current Assets − Current Liabilities</strong>
              </p>
              <p>
                Positive working capital means assets that convert to cash within a year exceed
                debts due within a year — the classic buffer for payroll, suppliers, and
                unexpected costs.
              </p>
              <p>
                <strong>Current Ratio</strong> = assets ÷ liabilities (1.5–2 is typical target).
                <strong> Quick Ratio</strong> strips out inventory (1.0+ is healthy).
                <strong> Cash Ratio</strong> counts only cash-like assets (0.2–0.5 is common).
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">What happens if working capital is negative?</p>
                <p className="text-muted-foreground">
                  Short-term liabilities exceed short-term assets — the business may struggle to
                  pay bills on time and may need a credit line or invoice financing.
                </p>
              </div>
              <div>
                <p className="font-semibold">Can a business have too much working capital?</p>
                <p className="text-muted-foreground">
                  Yes — idle cash earns little. Excess working capital is often better invested in
                  growth or returned to owners, as long as a prudent buffer is kept.
                </p>
              </div>
              <div>
                <p className="font-semibold">How often should I track it?</p>
                <p className="text-muted-foreground">
                  Monthly is standard for small businesses; lenders and investors look at the
                  trend over quarters, not a single snapshot.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <Link href="/business" className="text-primary hover:underline">
              ← More Business Calculators
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
