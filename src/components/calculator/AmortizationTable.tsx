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

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AmortizationTable = ({ rows, yearly = false }: { rows: AmortRow[]; yearly?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? rows : rows.slice(0, 12);

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-foreground mb-3">
        {yearly ? "Yearly" : "Monthly"} Amortization Schedule
      </h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary text-foreground">
              <th className="px-3 py-2 text-left font-medium">{yearly ? "Year" : "Month"}</th>
              <th className="px-3 py-2 text-right font-medium">Payment</th>
              <th className="px-3 py-2 text-right font-medium">Principal</th>
              <th className="px-3 py-2 text-right font-medium">Interest</th>
              <th className="px-3 py-2 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r) => (
              <tr key={r.period} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="px-3 py-2 text-muted-foreground">{r.period}</td>
                <td className="px-3 py-2 text-right">{fmt(r.payment)}</td>
                <td className="px-3 py-2 text-right text-accent">{fmt(r.principal)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{fmt(r.interest)}</td>
                <td className="px-3 py-2 text-right font-medium">{fmt(Math.max(0, r.balance))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 12 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-sm text-accent hover:underline mx-auto"
        >
          {expanded ? "Show Less" : `Show All ${rows.length} ${yearly ? "Years" : "Months"}`}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
};

export default AmortizationTable;


