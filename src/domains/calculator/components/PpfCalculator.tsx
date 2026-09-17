"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
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

const PPF_CAP = 150000;

function fmtInr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PpfCalculator() {
  const [yearly, setYearly] = useState("150000");
  const [rate, setRate] = useState("7.1");
  const [years, setYears] = useState("15");
  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => {
    const P = parseFloat(yearly) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = Math.max(1, parseInt(years) || 15);
    const cappedP = Math.min(P, PPF_CAP);

    let balance = 0;
    let totalDeposit = 0;
    const yearData: { year: number; deposit: number; interest: number; balance: number }[] = [];

    for (let y = 1; y <= n; y++) {
      totalDeposit += cappedP;
      const interest = (balance + cappedP) * r;
      balance = balance + cappedP + interest;
      yearData.push({ year: y, deposit: cappedP, interest, balance });
    }

    return {
      invested: totalDeposit,
      interest: balance - totalDeposit,
      maturity: balance,
      yearData,
      capped: P > PPF_CAP,
    };
  }, [yearly, rate, years]);

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="racira-page-container py-4">
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: inputs (Mortgage Calculator template) */}
        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
          <CardTitle>PPF Details</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your yearly deposit, rate, and tenure.</p>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ppf-yearly">Yearly deposit (₹)</Label>
              <Input
                id="ppf-yearly"
                type="number"
                value={yearly}
                onChange={(e) => setYearly(e.target.value)}
                min={500}
              />
              {result.capped && (
                <p className="text-xs text-amber-500">
                  Capped at ₹1,50,000/year — deposits above the limit earn no interest.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppf-rate">Interest rate (p.a.) (%)</Label>
              <Input
                id="ppf-rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                min={0}
                max={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppf-years">Tenure (years)</Label>
              <Input
                id="ppf-years"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min={15}
                max={30}
              />
              <p className="text-xs text-muted-foreground">Minimum lock-in is 15 years.</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button onClick={handleCalculate}>Calculate</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setYearly("150000");
                setRate("7.1");
                setYears("15");
                setShowResults(false);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* RIGHT: results + content (empty until Calculate) */}
        <div className="flex flex-col gap-4">

      {showResults && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="bg-primary/10 border-l-4 border-primary rounded-xl">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Maturity amount</p>
                <p className="text-2xl font-bold text-primary">{fmtInr(result.maturity)}</p>
                <p className="text-xs text-muted-foreground">After {parseInt(years) || 15} years</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total interest earned</p>
                <p className="text-2xl font-bold">{fmtInr(result.interest)}</p>
                <p className="text-xs text-muted-foreground">
                  {result.maturity > 0 ? ((result.interest / result.maturity) * 100).toFixed(0) : 0}% of
                  the corpus
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total deposited</p>
                <p className="text-2xl font-bold">{fmtInr(result.invested)}</p>
                <p className="text-xs text-muted-foreground">₹{PPF_CAP.toLocaleString("en-IN")} max/year</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Corpus Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.yearData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                    <Tooltip
                      formatter={(v) => fmtInr(Number(v))}
                      labelFormatter={(l) => `Year ${l}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Balance"
                    />
                    <Line
                      type="monotone"
                      dataKey="deposit"
                      stroke="#10b981"
                      name="Cumulative Deposit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Year-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Deposit</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.yearData.slice(0, 30).map((d) => (
                    <TableRow key={d.year}>
                      <TableCell className="font-medium">{d.year}</TableCell>
                      <TableCell className="text-right">{fmtInr(d.deposit)}</TableCell>
                      <TableCell className="text-right">{fmtInr(d.interest)}</TableCell>
                      <TableCell className="text-right font-medium">{fmtInr(d.balance)}</TableCell>
                    </TableRow>
                  ))}
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
                PPF compounds annually: interest is calculated on the opening balance plus the
                current year&apos;s deposit, then added to the balance. A 15-year minimum lock-in
                means the compounding curve really only shows its power in the back half of the
                tenure.
              </p>
              <p>
                <strong>EEE status</strong> means the deposit (deductible under 80C), the interest,
                and the maturity amount are all tax-free — one of the safest and most tax-efficient
                long-term instruments available in India.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">Can I extend PPF beyond 15 years?</p>
                <p className="text-muted-foreground">
                  Yes — in blocks of 5 years, with or without further deposits. Extending with
                  deposits keeps the EEE tax benefit flowing for as long as the account stays open.
                </p>
              </div>
              <div>
                <p className="font-semibold">Can I withdraw before 15 years?</p>
                <p className="text-muted-foreground">
                  Partial withdrawals are allowed from year 7 under specific conditions (up to 50%
                  of the balance at the end of year 6). Full closure before 15 years is only
                  permitted for serious illness, higher education, or a change of residency.
                </p>
              </div>
              <div>
                <p className="font-semibold">Is the interest rate fixed?</p>
                <p className="text-muted-foreground">
                  No — the government resets it quarterly, though it has been remarkably stable
                  (7.1% for several years). Treat the rate as a planning assumption, not a promise.
                </p>
              </div>
              <div>
                <p className="font-semibold">What is the minimum deposit?</p>
                <p className="text-muted-foreground">
                  ₹500 per year. The maximum is ₹1,50,000 per year — anything above the cap earns
                  no interest and is refunded.
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
    </div>
  );
}
