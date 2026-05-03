const fmtCurrency = (n: number, currency: string = "$") => {
  if (currency === "₹") {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface ResultItem {
  label: string;
  value: number;
  highlight?: boolean;
  format?: "currency" | "text";
  textValue?: string;
}

const ResultDisplay = ({ items, currency = "$" }: { items: ResultItem[]; currency?: string }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {items.map((item) => (
      <div key={item.label} className="result-card">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{item.label}</p>
        <p className={`text-xl font-bold ${item.highlight ? "text-accent" : "text-foreground"}`}>
          {item.textValue || fmtCurrency(item.value, currency)}
        </p>
      </div>
    ))}
  </div>
);

export default ResultDisplay;

