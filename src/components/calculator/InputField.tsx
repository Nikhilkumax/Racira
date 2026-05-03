import FinancialTooltip from "./FinancialTooltip";

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  min?: string;
  step?: string;
  placeholder?: string;
}

const InputField = ({ id, label, value, onChange, type = "number", tooltip, prefix, suffix, min, step, placeholder }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="flex items-center text-sm font-medium text-foreground mb-1.5">
      {label}
      {tooltip && <FinancialTooltip text={tooltip} />}
    </label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-calc ${prefix ? "pl-8" : ""} ${suffix ? "pr-14" : ""}`}
        min={min}
        step={step}
        placeholder={placeholder}
        aria-label={label}
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default InputField;

