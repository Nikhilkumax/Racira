"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AmortRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  extraPayment?: number;
}

const AmortizationTable = ({ rows, yearly = false, currency = "$", periodLabel }: { rows: AmortRow[]; yearly?: boolean; currency?: string; periodLabel?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? rows : rows.slice(0, 12);
  const defaultLabel = yearly ? "Year" : "Month";
  const displayLabel = periodLabel || defaultLabel;
  const columnHeader = yearly ? "Year" : (periodLabel === "Bi-Weekly" ? "Period" : "Month");

  const fmt = (n: number) => {
    const formatted = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currency}${formatted}`;
  };

  const totalPayment = rows.reduce((s, r) => s + r.payment, 0);
  const totalPrincipal = rows.reduce((s, r) => s + r.principal, 0);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);

  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-foreground mb-1">
        {yearly ? "Yearly" : (periodLabel ? periodLabel : "Monthly")} Amortization Schedule
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {yearly ? `(${rows.length} years)` : `(${rows.length} payments)`}
      </p>
      <div className="w-full max-w-full overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-[12px] sm:text-base table-fixed">
          <thead>
            <tr className="bg-secondary text-foreground">
              <th className="p-1 sm:px-3 sm:py-2 text-left font-medium w-[15%]">{columnHeader}</th>
              <th className="p-1 sm:px-3 sm:py-2 text-right font-medium w-[28%] sm:w-[22%]">Payment</th>
              <th className="p-1 sm:px-3 sm:py-2 text-right font-medium w-[28%] sm:w-[22%]">Principal</th>
              <th className="p-1 sm:px-3 sm:py-2 text-right font-medium hidden sm:table-cell sm:w-[20%]">Interest</th>
              <th className="p-1 sm:px-3 sm:py-2 text-right font-medium w-[29%] sm:w-[21%]">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r) => (
              <tr key={r.period} className="border-t border-border hover:bg-[#f8f9fa] dark:hover:bg-secondary/30 cursor-default transition-colors">
                <td className="p-1 sm:px-3 sm:py-2 text-muted-foreground">{r.period}</td>
                <td className="p-1 sm:px-3 sm:py-2 text-right text-foreground font-medium">{fmt(r.payment)}</td>
                <td className="p-1 sm:px-3 sm:py-2 text-right text-[hsl(217,91%,40%)] dark:text-primary font-medium">{fmt(r.principal)}</td>
                <td className="p-1 sm:px-3 sm:py-2 text-right text-foreground hidden sm:table-cell">{fmt(r.interest)}</td>
                <td className="p-1 sm:px-3 sm:py-2 text-right font-medium">{fmt(Math.max(0, r.balance))}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-[#e2e8f0] bg-[#f8fafc] dark:border-border dark:bg-secondary/10 font-bold">
              <td className="p-1 sm:px-3 sm:py-3 text-left">Total</td>
              <td className="p-1 sm:px-3 sm:py-3 text-right">{fmt(totalPayment)}</td>
              <td className="p-1 sm:px-3 sm:py-3 text-right">{fmt(totalPrincipal)}</td>
              <td className="p-1 sm:px-3 sm:py-3 text-right hidden sm:table-cell">{fmt(totalInterest)}</td>
              <td className="p-1 sm:px-3 sm:py-3 text-right">—</td>
            </tr>
          </tbody>
        </table>
      </div>
      {rows.length > 12 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-base text-primary hover:underline mx-auto"
        >
          {expanded ? "Show Less" : `Show All ${rows.length} ${displayLabel}s`}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
};

export default AmortizationTable;


