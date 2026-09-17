"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

export default function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPayment, setDownPayment] = useState("80000");
  const [mortgageRate, setMortgageRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [rent, setRent] = useState("1800");
  const [rentIncrease, setRentIncrease] = useState("3");
  const [investmentReturn, setInvestmentReturn] = useState("7");
  const [homeAppreciation, setHomeAppreciation] = useState("3");
  const [years, setYears] = useState("10");
  const [showResults, setShowResults] = useState(false);

  const price = parseFloat(homePrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const rate = (parseFloat(mortgageRate) || 0) / 100;
  const term = parseFloat(loanTerm) || 30;
  const monthlyRent = parseFloat(rent) || 0;
  const rentInc = (parseFloat(rentIncrease) || 0) / 100;
  const invReturn = (parseFloat(investmentReturn) || 0) / 100;
  const appr = (parseFloat(homeAppreciation) || 0) / 100;
  const horizon = parseFloat(years) || 10;

  const loanAmount = Math.max(price - down, 0);
  const monthlyRate = rate / 12;
  const months = term * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : loanAmount / months;

  // Rent total: growing rent over horizon (rent kept separate from investment for buy side)
  let rentTotal = 0;
  for (let y = 1; y <= horizon; y++) {
    const yrRent = monthlyRent * 12 * Math.pow(1 + rentInc, y - 1);
    rentTotal += yrRent;
  }

  // Buy side: principal paid down + appreciation vs. renting + investing the difference
  let principalPaid = 0;
  let interestPaid = 0;
  let balance = loanAmount;
  for (let m = 1; m <= Math.min(months, horizon * 12); m++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;
    principalPaid += principal;
    interestPaid += interest;
  }
  const homeValue = price * Math.pow(1 + appr, horizon);
  const equity = Math.max(homeValue - balance, 0);

  // Renter invests the down payment + monthly buy/rent difference
  const buyMonthly = monthlyPayment + (price * 0.011) / 12; // ~1.1% property tax+insurance
  const diffMonthly = Math.max(buyMonthly - monthlyRent, 0);
  const monthlyInvRate = invReturn / 12;
  const renterMonths = horizon * 12;
  const investedPrincipal = down + diffMonthly * renterMonths;
  const investedValue =
    down * Math.pow(1 + invReturn, horizon) +
    diffMonthly * ((Math.pow(1 + monthlyInvRate, renterMonths) - 1) / monthlyInvRate);

  const rentNetWorth = investedValue;
  const buyNetWorth = equity;

  const chartData = [
    { name: "Net Worth at Year " + horizon, Rent: Math.round(rentNetWorth), Buy: Math.round(buyNetWorth) },
  ];

  const handleCalculate = () => setShowResults(true);

  return (
    <div className="racira-page-container py-4">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Personal Finance", href: "/personal-finance" },
          {
            label: "Rent vs Buy Calculator",
            href: "/calculator/rent-vs-buy-calculator",
          },
        ]}
      />

        {/* LEFT: inputs (Mortgage Calculator template) */}
        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Scenario Inputs</h2>
          <div className="contents">

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Home Price</Label>
              <Input
                id="price"
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(e.target.value)}
                placeholder="400000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="down">Down Payment</Label>
              <Input
                id="down"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="80000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Mortgage Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                value={mortgageRate}
                onChange={(e) => setMortgageRate(e.target.value)}
                placeholder="6.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Loan Term (years)</Label>
              <Input
                id="term"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent">Monthly Rent</Label>
              <Input
                id="rent"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder="1800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentInc">Rent Increase (%/yr)</Label>
              <Input
                id="rentInc"
                type="number"
                value={rentIncrease}
                onChange={(e) => setRentIncrease(e.target.value)}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv">Investment Return (%)</Label>
              <Input
                id="inv"
                type="number"
                value={investmentReturn}
                onChange={(e) => setInvestmentReturn(e.target.value)}
                placeholder="7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appr">Home Appreciation (%)</Label>
              <Input
                id="appr"
                type="number"
                value={homeAppreciation}
                onChange={(e) => setHomeAppreciation(e.target.value)}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Time Horizon (years)</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
          <Button onClick={handleCalculate} className="mt-6 w-full sm:w-auto">
            Calculate
          </Button>
        
          </div>
        </div>

        {/* RIGHT: results + content */}
        <div className="flex flex-col gap-4">

      {showResults && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6">
              <p className="text-sm text-muted-foreground">Buy: Net Worth in {horizon} yrs</p>
              <p className="text-2xl font-bold text-primary">
                $
                {buyNetWorth.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-muted-foreground">Home value − remaining loan</p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Rent: Invested Portfolio</p>
                <p className="text-2xl font-bold">
                  $
                  {rentNetWorth.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Down payment + monthly savings, invested</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Better Deal</p>
                <p className="text-2xl font-bold">
                  {buyNetWorth > rentNetWorth ? "Buy" : "Rent"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.abs(buyNetWorth - rentNetWorth).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })}{" "}
                  difference at year {horizon}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Net Worth Comparison at Year {horizon}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Rent" fill="#3b82f6" />
                    <Bar dataKey="Buy" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Monthly Mortgage Payment</p>
                <p className="font-semibold">
                  $
                  {monthlyPayment.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Principal Paid Down</p>
                <p className="font-semibold">
                  $
                  {principalPaid.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest Paid</p>
                <p className="font-semibold">
                  $
                  {interestPaid.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Rent Paid</p>
                <p className="font-semibold">
                  $
                  {rentTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Buy side:</strong> you pay the mortgage (plus ~1.1%/yr in property tax and
                insurance), build equity as principal is paid down, and your home appreciates at
                the assumed rate. Net worth = home value minus the remaining loan balance.
              </p>
              <p>
                <strong>Rent side:</strong> you keep your down payment invested and invest the
                monthly difference between buying and renting at the assumed return.
              </p>
              <p>
                This is a simplified model — it excludes transaction costs, maintenance, tax
                benefits, and moving flexibility, which often favor renting over short horizons.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">How many years until buying wins?</p>
                <p className="text-muted-foreground">
                  Usually 5–7 years once closing costs are included — the "breakeven horizon."
                  Below that, renting and investing the difference typically comes out ahead.
                </p>
              </div>
              <div>
                <p className="font-semibold">Does the appreciation assumption matter?</p>
                <p className="text-muted-foreground">
                  Immensely — try 1% vs 5% and watch the verdict flip. Long-run US appreciation
                  has averaged roughly 3–4%/yr including inflation.
                </p>
              </div>
              <div>
                <p className="font-semibold">What costs are not included?</p>
                <p className="text-muted-foreground">
                  Closing costs (2–5%), agent fees on resale, maintenance (~1%/yr), HOA fees, and
                  mortgage interest tax deductions. For a personal decision, factor those in
                  manually.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <Link href="/personal-finance" className="text-primary hover:underline">
              ← More Personal Finance Calculators
            </Link>
          </div>
        </>
      )}
        </div>
    </div>
  );
}
