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

export default function TreasuryBillCalculator() {
  const [faceValue, setFaceValue] = useState("10000");
  const [discountRate, setDiscountRate] = useState("5");
  const [daysToMaturity, setDaysToMaturity] = useState("91");
  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => {
    const fv = parseFloat(faceValue) || 0;
    const dr = (parseFloat(discountRate) || 0) / 100;
    const days = parseFloat(daysToMaturity) || 0;

    const discountAmount = fv * dr * (days / 360);
    const purchasePrice = fv - discountAmount;
    const investmentYield =
      purchasePrice > 0 && days > 0 ? (discountAmount / purchasePrice) * (360 / days) * 100 : 0;
    const annualizedYield =
      purchasePrice > 0 && days > 0 ? (Math.pow(fv / purchasePrice, 365 / days) - 1) * 100 : 0;
    const bondEquivalent =
      purchasePrice > 0 && days > 0 ? (discountAmount / purchasePrice) * (365 / days) * 100 : 0;

    return { purchasePrice, discountAmount, investmentYield, annualizedYield, bondEquivalent };
  }, [faceValue, discountRate, daysToMaturity]);

  const yieldData = [
    { name: "Bank Discount", value: Number((parseFloat(discountRate) || 0).toFixed(2)) },
    { name: "Investment Yield", value: Number(result.investmentYield.toFixed(2)) },
    { name: "Bond Equivalent", value: Number(result.bondEquivalent.toFixed(2)) },
    { name: "Annualized", value: Number(result.annualizedYield.toFixed(2)) },
  ];

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="racira-page-container py-4">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Finance", href: "/finance" },
          {
            label: "Treasury Bill Calculator",
            href: "/calculator/treasury-bill-calculator",
          },
        ]}
      />

        {/* LEFT: inputs (Mortgage Calculator template) */}
        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
          <h2 className="text-lg font-bold text-foreground">T-Bill Terms</h2>
          <p className="text-sm text-muted-foreground">Enter the face value, discount rate, and term.</p>
          <div className="contents">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tb-face">Face value ($)</Label>
              <Input
                id="tb-face"
                type="number"
                value={faceValue}
                onChange={(e) => setFaceValue(e.target.value)}
                min={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tb-rate">Bank discount rate (%)</Label>
              <Input
                id="tb-rate"
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                min={0}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tb-days">Days to maturity</Label>
              <Input
                id="tb-days"
                type="number"
                value={daysToMaturity}
                onChange={(e) => setDaysToMaturity(e.target.value)}
                min={1}
                max={364}
              />
              <p className="text-xs text-muted-foreground">Standard: 28, 56, 91, 119, 182, or 364.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleCalculate}>Calculate</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFaceValue("10000");
                setDiscountRate("5");
                setDaysToMaturity("91");
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
                <p className="text-sm text-muted-foreground">Purchase price</p>
                <p className="text-2xl font-bold text-primary">{fmt(result.purchasePrice)}</p>
                <p className="text-xs text-muted-foreground">
                  Pay this today, get {fmt(parseFloat(faceValue) || 0)} at maturity
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Discount (your profit)</p>
                <p className="text-2xl font-bold">{fmt(result.discountAmount)}</p>
                <p className="text-xs text-muted-foreground">Face value − purchase price</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Annualized compound yield</p>
                <p className="text-2xl font-bold">{result.annualizedYield.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">
                  True return with reinvestment
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Yield Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Yield" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                The bank discount quote is computed on face value with a 360-day year — it always
                understates the true return you earn on the smaller amount you actually paid.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Yield Breakdown</CardTitle>
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
                    <TableCell>Investment yield (360-day basis)</TableCell>
                    <TableCell className="text-right">{result.investmentYield.toFixed(4)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bond equivalent yield (365-day)</TableCell>
                    <TableCell className="text-right">{result.bondEquivalent.toFixed(4)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Annualized compound yield</TableCell>
                    <TableCell className="text-right font-medium">
                      {result.annualizedYield.toFixed(4)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                T-Bills are sold at a discount to face value and redeemed at par — you never
                receive a coupon; the discount is your entire return. The bank discount rate is
                computed on the face value over a 360-day year, so it looks lower than the return
                you actually earn on the discounted purchase price.
              </p>
              <p>
                <strong>Annualized compound yield</strong> (the fair comparison across maturities)
                compounds the holding-period return to a full year, so a 5% discount quote on a
                91-day bill works out to about 5.23% when reinvested.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">How do I buy T-Bills?</p>
                <p className="text-muted-foreground">
                  Through a TreasuryDirect account (min $100, in $100 increments) or a broker.
                  Auction results set the discount rate, and you can also buy on the secondary
                  market.
                </p>
              </div>
              <div>
                <p className="font-semibold">Are T-Bills risky?</p>
                <p className="text-muted-foreground">
                  Backed by the US government, they are considered essentially risk-free on
                  credit. The main risks are inflation eroding the modest return and
                  opportunity cost versus higher-yielding investments.
                </p>
              </div>
              <div>
                <p className="font-semibold">Why use a 360-day year?</p>
                <p className="text-muted-foreground">
                  It is the money-market convention inherited from banking. It makes the quoted
                  rate lower than the true yield — hence the bond-equivalent adjustment to a
                  365-day year.
                </p>
              </div>
              <div>
                <p className="font-semibold">What about state taxes?</p>
                <p className="text-muted-foreground">
                  Interest on T-Bills is exempt from state and local income tax but is subject to
                  federal tax. In high-tax states this pushes the after-tax yield meaningfully
                  higher than a CD of the same nominal rate.
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
