"use client";

import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
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

const PIE_COLORS = ["#3b82f6", "#f59e0b"];

export default function PriceToBookRatioCalculator() {
  const [marketPrice, setMarketPrice] = useState("25");
  const [bookValue, setBookValue] = useState("20");
  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => {
    const price = parseFloat(marketPrice) || 0;
    const book = parseFloat(bookValue) || 0;
    const ratio = book > 0 ? price / book : 0;
    const premiumDiscount = ratio > 0 ? (ratio - 1) * 100 : 0;
    const impliedBookGap = price - book;
    let label = "Fairly valued";
    if (ratio < 1) label = "Trading below book value";
    else if (ratio > 3) label = "Premium — priced for growth";

    return { ratio, premiumDiscount, impliedBookGap, label };
  }, [marketPrice, bookValue]);

  const pieData = [
    { name: "Book Value", value: parseFloat(bookValue) || 0 },
    { name: "Premium to Book", value: Math.max(parseFloat(marketPrice) - (parseFloat(bookValue) || 0), 0) },
  ].filter((d) => d.value >= 0);

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="racira-page-container py-4">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Finance", href: "/finance" },
          {
            label: "Price-to-Book Ratio Calculator",
            href: "/calculator/price-to-book-ratio-calculator",
          },
        ]}
      />

        {/* LEFT: inputs (Mortgage Calculator template) */}
        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Stock Details</h2>
          <p className="text-sm text-muted-foreground">Enter the market price and book value per share.</p>
          <div className="contents">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pb-price">Market price per share ($)</Label>
              <Input
                id="pb-price"
                type="number"
                value={marketPrice}
                onChange={(e) => setMarketPrice(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pb-book">Book value per share ($)</Label>
              <Input
                id="pb-book"
                type="number"
                value={bookValue}
                onChange={(e) => setBookValue(e.target.value)}
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
                setMarketPrice("25");
                setBookValue("20");
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
                <p className="text-sm text-muted-foreground">P/B Ratio</p>
                <p className="text-2xl font-bold text-primary">{result.ratio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{result.label}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Premium / discount to book</p>
                <p className="text-2xl font-bold">
                  {result.premiumDiscount > 0 ? "+" : ""}
                  {result.premiumDiscount.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Market price vs. book value</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Market vs. book gap</p>
                <p className="text-2xl font-bold">
                  {result.impliedBookGap > 0 ? "+" : ""}
                  {fmt(result.impliedBookGap)}
                </p>
                <p className="text-xs text-muted-foreground">Per share</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Composition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        label={({ name, percent }) =>
                          percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                        }
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(Number(v))} />
                    </PieChart>
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
                      <TableCell>Market price</TableCell>
                      <TableCell className="text-right">
                        {fmt(result.ratio * (parseFloat(bookValue) || 0))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Book value</TableCell>
                      <TableCell className="text-right">{fmt(parseFloat(bookValue) || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Market vs. book gap</TableCell>
                      <TableCell className="text-right">
                        {result.impliedBookGap > 0 ? "+" : ""}
                        {fmt(result.impliedBookGap)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How to Read It</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                A stock at $25 with $20 of book value trades at 1.25× book — a 25% premium. Banks
                and insurers are often judged on P/B: a ratio below 1 can signal undervaluation
                (or deteriorating assets), while asset-light growth companies routinely trade at
                5–10× book because their value sits in intangibles that book accounting doesn&apos;t
                capture.
              </p>
              <p>
                P/B is most meaningful where book value tracks economic value — financials,
                insurers, real estate, and commodity businesses. For tech and services, book value
                says little, so a low P/B there is usually a red flag rather than a bargain.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">What does a P/B below 1 mean?</p>
                <p className="text-muted-foreground">
                  The market values the company below the value of its net assets — often a
                  contrarian signal, but sometimes justified by bad loans, obsolete inventory, or
                  declining returns on equity.
                </p>
              </div>
              <div>
                <p className="font-semibold">What is a good P/B ratio?</p>
                <p className="text-muted-foreground">
                  There is no universal number — compare to the company&apos;s own history and its
                  sector. A bank at 1.2× book is normal; a software company at 1.2× book would be
                  startlingly cheap.
                </p>
              </div>
              <div>
                <p className="font-semibold">How does P/B relate to ROE?</p>
                <p className="text-muted-foreground">
                  P/B × ROE ≈ P/E. A company earning a high return on equity deserves a higher
                  multiple of book — the two ratios are two sides of the same valuation coin.
                </p>
              </div>
              <div>
                <p className="font-semibold">Why is book value per share used?</p>
                <p className="text-muted-foreground">
                  It normalizes for share count: total shareholders&apos; equity divided by shares
                  outstanding gives the per-share claim on net assets that the market price can be
                  compared against.
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
