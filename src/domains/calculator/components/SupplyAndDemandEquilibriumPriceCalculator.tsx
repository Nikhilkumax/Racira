"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
import PopularCalculators from "@/components/PopularCalculators";
import Link from "next/link";

export default function SupplyAndDemandEquilibriumPriceCalculator() {
  const [a, setA] = useState("100");
  const [b, setB] = useState("2");
  const [c, setC] = useState("20");
  const [d, setD] = useState("1.5");
  const [showResults, setShowResults] = useState(false);
  // Snapshot of the inputs behind the displayed results; it changes only when
  // Calculate runs, so typing never recalculates (Gold Standard rule).
  const [calcInputs, setCalcInputs] = useState(() => ({ a, b, c, d }));

  const result = useMemo(() => {
    const aN = parseFloat(calcInputs.a) || 0;
    const bN = parseFloat(calcInputs.b) || 0;
    const cN = parseFloat(calcInputs.c) || 0;
    const dN = parseFloat(calcInputs.d) || 0;

    if (bN + dN === 0) {
      return { price: 0, quantity: 0, invalid: true, demandAtP: 0, supplyAtP: 0 };
    }
    const price = (aN - cN) / (bN + dN);
    const quantity = aN - bN * price;
    const demandAtP = aN - bN * price;
    const supplyAtP = cN + dN * price;

    return { price, quantity, invalid: false, demandAtP, supplyAtP };
  }, [calcInputs]);

  const aN = parseFloat(calcInputs.a) || 0;
  const bN = parseFloat(calcInputs.b) || 0;
  const cN = parseFloat(calcInputs.c) || 0;
  const dN = parseFloat(calcInputs.d) || 0;

  const chartData = useMemo(() => {
    const maxP = Math.max(result.price * 1.6, 1);
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const P = (maxP * i) / 20;
      const demand = Math.max(aN - bN * P, 0);
      const supply = Math.max(cN + dN * P, 0);
      pts.push({ price: Number(P.toFixed(2)), Demand: Number(demand.toFixed(2)), Supply: Number(supply.toFixed(2)) });
    }
    return pts;
  }, [aN, bN, cN, dN, result.price]);

  const handleCalculate = () => {
    setCalcInputs({ a, b, c, d });
    setShowResults(true);
  };

  return (
    <div className="racira-page-container py-4">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Economics", href: "/economics" },
          {
            label: "Supply & Demand Equilibrium Calculator",
            href: "/calculator/supply-and-demand-equilibrium-price-calculator",
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">

        {/* LEFT: inputs (Mortgage Calculator template) */}
        <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Curve Parameters</h2>
          <p className="text-sm text-muted-foreground">
            Demand: Q = a − b·P &nbsp;&nbsp;|&nbsp;&nbsp; Supply: Q = c + d·P
          </p>
          <div className="contents">

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="eq-a">Demand intercept (a)</Label>
              <Input id="eq-a" type="number" value={a} onChange={(e) => setA(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-b">Demand slope (b)</Label>
              <Input id="eq-b" type="number" value={b} onChange={(e) => setB(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-c">Supply intercept (c)</Label>
              <Input id="eq-c" type="number" value={c} onChange={(e) => setC(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-d">Supply slope (d)</Label>
              <Input id="eq-d" type="number" value={d} onChange={(e) => setD(e.target.value)} />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleCalculate}>Calculate</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setA("100");
                setB("2");
                setC("20");
                setD("1.5");
                setCalcInputs({ a: "100", b: "2", c: "20", d: "1.5" });
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
          {result.invalid ? (
            <Card className="mb-6 border-destructive/30 bg-destructive/5">
              <CardContent className="p-6 text-sm text-destructive">
                The slopes sum to zero, so the curves are parallel and no equilibrium exists.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <Card className="bg-primary/10 border-l-4 border-primary rounded-xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Equilibrium price (P*)</p>
                    <p className="text-2xl font-bold text-primary">{result.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Where demand = supply</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Equilibrium quantity (Q*)</p>
                    <p className="text-2xl font-bold">{result.quantity.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Units traded at P*</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Market check</p>
                    <p className="text-2xl font-bold">
                      {result.demandAtP.toFixed(2)} = {result.supplyAtP.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Demand equals supply at P*</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Demand &amp; Supply Curves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="price" label={{ value: "Price (P)", position: "insideBottom", offset: -4 }} />
                        <YAxis label={{ value: "Quantity (Q)", angle: -90, position: "insideLeft" }} />
                        <Tooltip
                          formatter={(v) => Number(v).toFixed(2)}
                          labelFormatter={(l) => `Price ${l}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Demand"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="Supply"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    The curves cross at the equilibrium — above P* supply exceeds demand (surplus,
                    prices fall); below P* demand exceeds supply (shortage, prices rise).
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Equilibrium Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Check</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Quantity demanded at P*</TableCell>
                        <TableCell className="text-right">{result.demandAtP.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Quantity supplied at P*</TableCell>
                        <TableCell className="text-right">{result.supplyAtP.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Setting demand equal to supply — a − b·P = c + d·P — gives the equilibrium price
                P* = (a − c) ÷ (b + d), and plugging P* back into either curve gives the
                equilibrium quantity. The math assumes straight-line (linear) curves for
                simplicity.
              </p>
              <p>
                With demand Q = 100 − 2P and supply Q = 20 + 1.5P, setting them equal gives
                P* = 80 ÷ 3.5 = $22.86 and Q* = 54.29 units. At any higher price, supply exceeds
                demand and prices fall; at any lower price, shortages push prices up — the market
                gravitates back to this clearing point.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">What shifts the demand curve (a or b)?</p>
                <p className="text-muted-foreground">
                  Income, preferences, prices of substitutes and complements, expectations, and
                  population move the intercept a (shift) or rotate the slope b. A rightward
                  demand shift raises both equilibrium price and quantity.
                </p>
              </div>
              <div>
                <p className="font-semibold">What shifts the supply curve (c or d)?</p>
                <p className="text-muted-foreground">
                  Input costs, technology, taxes, and the number of sellers move the intercept c.
                  Cheaper inputs shift supply right, lowering price and raising quantity.
                </p>
              </div>
              <div>
                <p className="font-semibold">Can the equilibrium price be negative?</p>
                <p className="text-muted-foreground">
                  In the math, yes, if the intercepts are unusual — in reality it simply means no
                  positive price clears the market, which usually signals an unusable model
                  specification.
                </p>
              </div>
              <div>
                <p className="font-semibold">Is the linear model realistic?</p>
                <p className="text-muted-foreground">
                  Real curves are curved, but near the equilibrium a linear approximation is
                  typically accurate enough for classroom and quick business analysis. The
                  qualitative result — price and quantity converge to the crossing point — holds
                  for any downward-sloping demand and upward-sloping supply.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <Link href="/economics" className="text-primary hover:underline">
              ← More Economics Calculators
            </Link>
          </div>
        </>
      )}
        </div>
      </div>

      <div className="max-w-[1180px]">
        <PopularCalculators exclude="/calculator/supply-and-demand-equilibrium-price-calculator" />
      </div>
    </div>
  );
}
