"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

export default function InventoryTurnoverCalculator() {
  const [cogs, setCogs] = useState("500000");
  const [begInv, setBegInv] = useState("100000");
  const [endInv, setEndInv] = useState("150000");
  const [period, setPeriod] = useState("year");
  const [showResults, setShowResults] = useState(false);

  const cogsNum = parseFloat(cogs) || 0;
  const begNum = parseFloat(begInv) || 0;
  const endNum = parseFloat(endInv) || 0;
  const avgInv = (begNum + endNum) / 2;

  const daysInPeriod = period === "year" ? 365 : period === "quarter" ? 91.25 : 30.42;
  const turnover = avgInv > 0 ? cogsNum / avgInv : 0;
  const daysToSell = turnover > 0 ? daysInPeriod / turnover : 0;
  const turnoverAnnualized = turnover * (365 / daysInPeriod);

  const daysInInventory = daysToSell;
  const benchmark = daysInPeriod === 365 ? 45 : daysInPeriod === 91.25 ? 11.25 : 3.75;
  const rating =
    daysInInventory <= 0
      ? "—"
      : daysInInventory <= benchmark * 0.6
        ? "Excellent"
        : daysInInventory <= benchmark
          ? "Good"
          : daysInInventory <= benchmark * 1.5
            ? "Fair"
            : "Poor";

  // Chart: inventory turnover over a 12-month window (monthly projection)
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthlyCogs = cogsNum / 12;
    const inv = Math.max(begNum + ((endNum - begNum) * i) / 11, 1);
    return {
      month: `M${month}`,
      "Avg Inventory": Math.round(inv),
      Turnover: Number(((monthlyCogs * 12) / avgInv).toFixed(2)),
    };
  });

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Business", href: "/business" },
          {
            label: "Inventory Turnover Calculator",
            href: "/calculator/inventory-turnover-calculator",
          },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Inventory Turnover Calculator</h1>
        <p className="text-muted-foreground">
          Measure how efficiently your business sells and replaces inventory — how many times your
          average stock is sold in a period.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Inventory Turnover</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cogs">Cost of Goods Sold (COGS)</Label>
              <Input
                id="cogs"
                type="number"
                value={cogs}
                onChange={(e) => setCogs(e.target.value)}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Yearly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="begInv">Beginning Inventory</Label>
              <Input
                id="begInv"
                type="number"
                value={begInv}
                onChange={(e) => setBegInv(e.target.value)}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endInv">Ending Inventory</Label>
              <Input
                id="endInv"
                type="number"
                value={endInv}
                onChange={(e) => setEndInv(e.target.value)}
                placeholder="150000"
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
                <p className="text-sm text-muted-foreground">Inventory Turnover</p>
                <p className="text-2xl font-bold">{turnover.toFixed(2)}×</p>
                <p className="text-xs text-muted-foreground">times per {period}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Avg Inventory</p>
                <p className="text-2xl font-bold">
                  $
                  {avgInv.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">(beginning + ending) ÷ 2</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Days to Sell Inventory</p>
                <p className="text-2xl font-bold">{daysToSell.toFixed(1)} days</p>
                <p className="text-xs text-muted-foreground">DSI — {daysInPeriod.toFixed(0)}-day {period}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Annualized Turnover</p>
              <p className="text-3xl font-bold">{turnoverAnnualized.toFixed(2)}×</p>
              <p className="text-sm mt-2">
                Rating:{" "}
                <span
                  className={
                    rating === "Excellent" || rating === "Good"
                      ? "text-green-600 font-semibold"
                      : rating === "Fair"
                        ? "text-yellow-600 font-semibold"
                        : "text-red-600 font-semibold"
                  }
                >
                  {rating}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Typical healthy DSI is {benchmark.toFixed(0)} days or less for this period.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Turnover &amp; Inventory Over the Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Avg Inventory"
                      stroke="#8884d8"
                      name="Avg Inventory"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Turnover"
                      stroke="#82ca9d"
                      name="Turnover"
                    />
                  </LineChart>
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
                <strong>Inventory Turnover = COGS ÷ Average Inventory</strong>
              </p>
              <p>
                Average inventory is (beginning + ending) ÷ 2. The ratio shows how many times the
                average stock level was sold and replaced during the period.
              </p>
              <p>
                <strong>Days to Sell (DSI) = Days in Period ÷ Turnover</strong> — a lower number
                means faster-moving stock and less cash tied up on shelves.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">What is a good inventory turnover ratio?</p>
                <p className="text-muted-foreground">
                  It depends on the industry — groceries turn 10–15× a year, auto dealerships
                  closer to 3×. Compare against your own sector rather than a universal number.
                </p>
              </div>
              <div>
                <p className="font-semibold">How can I improve my turnover?</p>
                <p className="text-muted-foreground">
                  Trim slow-moving lines, run promotions on stale stock, negotiate shorter lead
                  times with suppliers, and forecast demand more tightly.
                </p>
              </div>
              <div>
                <p className="font-semibold">Is higher always better?</p>
                <p className="text-muted-foreground">
                  Not necessarily — extremely high turnover can mean you are frequently out of
                  stock and losing sales. Balance turnover against stock availability.
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
