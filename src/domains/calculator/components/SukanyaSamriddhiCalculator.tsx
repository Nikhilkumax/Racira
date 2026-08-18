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

const DEPOSIT_YEARS = 15;
const MATURITY_YEARS = 21;

function fmtInr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SukanyaSamriddhiCalculator() {
  const [yearlyDeposit, setYearlyDeposit] = useState("150000");
  const [interestRate, setInterestRate] = useState("8.2");
  const [girlAge, setGirlAge] = useState("5");
  const [showResults, setShowResults] = useState(false);

  const result = useMemo(() => {
    const deposit = parseFloat(yearlyDeposit) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100;
    const age = parseInt(girlAge) || 0;

    const r = rate;
    let balance = 0;
    let totalDeposited = 0;
    const yearlyBreakdown: { year: number; deposit: number; interest: number; balance: number }[] = [];

    for (let y = 1; y <= MATURITY_YEARS; y++) {
      const dep = y <= DEPOSIT_YEARS ? deposit : 0;
      totalDeposited += dep;
      balance += dep;
      const interest = balance * r;
      balance += interest;
      yearlyBreakdown.push({ year: y, deposit: dep, interest, balance });
    }

    return {
      totalDeposited,
      totalInterest: balance - totalDeposited,
      maturityAmount: balance,
      maturityYear: new Date().getFullYear() + (21 - Math.min(age, 10)),
      yearlyBreakdown,
    };
  }, [yearlyDeposit, interestRate, girlAge]);

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Finance", href: "/finance" },
          {
            label: "Sukanya Samriddhi Calculator",
            href: "/calculator/sukanya-samriddhi-calculator",
          },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-foreground">
          Sukanya Samriddhi Calculator
        </h1>
        <p className="text-muted-foreground">
          Estimate the maturity amount of a Sukanya Samriddhi account for your girl child&apos;s
          education and marriage fund — deposits for 15 years, compounding for 21.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>SSY Details</CardTitle>
          <CardDescription>Enter the yearly deposit, rate, and your daughter&apos;s age.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ssy-deposit">Yearly deposit (₹)</Label>
              <Input
                id="ssy-deposit"
                type="number"
                value={yearlyDeposit}
                onChange={(e) => setYearlyDeposit(e.target.value)}
                min={250}
              />
              <p className="text-xs text-muted-foreground">Range: ₹250 – ₹1,50,000 per year.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssy-rate">Interest rate (p.a.) (%)</Label>
              <Input
                id="ssy-rate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                min={0}
                max={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssy-age">Girl&apos;s current age</Label>
              <Input
                id="ssy-age"
                type="number"
                value={girlAge}
                onChange={(e) => setGirlAge(e.target.value)}
                min={0}
                max={10}
              />
              <p className="text-xs text-muted-foreground">Eligible up to age 10.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleCalculate}>Calculate</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setYearlyDeposit("150000");
                setInterestRate("8.2");
                setGirlAge("5");
                setShowResults(false);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="bg-primary/10 border-l-4 border-primary rounded-xl">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Maturity amount</p>
                <p className="text-2xl font-bold text-primary">{fmtInr(result.maturityAmount)}</p>
                <p className="text-xs text-muted-foreground">Matures in {result.maturityYear}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total interest earned</p>
                <p className="text-2xl font-bold">{fmtInr(result.totalInterest)}</p>
                <p className="text-xs text-muted-foreground">
                  {result.maturityAmount > 0
                    ? ((result.totalInterest / result.maturityAmount) * 100).toFixed(0)
                    : 0}
                  % of the corpus
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total deposited (15 yrs)</p>
                <p className="text-2xl font-bold">{fmtInr(result.totalDeposited)}</p>
                <p className="text-xs text-muted-foreground">Compounds 6 more years after</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Corpus Growth Over 21 Years</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.yearlyBreakdown}>
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
                      stroke="#ec4899"
                      strokeWidth={2}
                      name="Balance"
                    />
                    <Line
                      type="monotone"
                      dataKey="deposit"
                      stroke="#10b981"
                      name="Deposit"
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
                  {result.yearlyBreakdown.map((d) => (
                    <TableRow key={d.year}>
                      <TableCell className="font-medium">{d.year}</TableCell>
                      <TableCell className="text-right">
                        {d.deposit > 0 ? fmtInr(d.deposit) : "—"}
                      </TableCell>
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
                You deposit every year for 15 years (the account must be opened before the girl
                turns 10), then the balance keeps compounding for 6 more years until maturity at
                age 21 — that final stretch without deposits is where a big share of the interest
                is earned.
              </p>
              <p>
                <strong>EEE status:</strong> deposits qualify for the 80C deduction, and both the
                interest and maturity are tax-free. The account can be opened with just ₹250 and
                topped up to ₹1,50,000 a year.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">What happens after 15 years of deposits?</p>
                <p className="text-muted-foreground">
                  Contributions stop but the balance keeps compounding at the prevailing rate
                  until maturity in the 21st year, when the full amount is paid out to the girl.
                </p>
              </div>
              <div>
                <p className="font-semibold">Can I withdraw before maturity?</p>
                <p className="text-muted-foreground">
                  Up to 50% of the balance can be withdrawn once the girl reaches 18, for higher
                  education or marriage. Premature closure is allowed only in exceptional cases
                  (death, life-threatening illness, etc.).
                </p>
              </div>
              <div>
                <p className="font-semibold">Who can open an account?</p>
                <p className="text-muted-foreground">
                  A guardian can open one account for each girl child under 10 — two children
                  means two accounts, each eligible for its own ₹1,50,000 annual limit.
                </p>
              </div>
              <div>
                <p className="font-semibold">Is the interest rate guaranteed?</p>
                <p className="text-muted-foreground">
                  No — it is set quarterly by the government, but SSY has consistently offered a
                  premium over PPF (recently 8.2% vs 7.1%), making it the best fixed-return
                  small-savings scheme.
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
  );
}
