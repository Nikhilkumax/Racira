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
  disabled?: boolean;
}

const InputField = ({
  id,
  label,
  value,
  onChange,
  type = "number",
  tooltip,
  prefix,
  suffix,
  min,
  step,
  placeholder,
  disabled,
}: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="flex items-center text-sm font-medium text-foreground mb-1">
      {label}
      {tooltip && <FinancialTooltip text={tooltip} />}
    </label>
    <div className={`calc-input-wrapper ${disabled ? "opacity-50 grayscale-[0.5] cursor-not-allowed" : ""}`}>
      {prefix && <span className="calc-input-prefix">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-calc${prefix ? " has-prefix" : ""}${suffix ? " has-unit" : ""}`}
        min={min}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label}
      />
      {suffix && <span className="calc-input-unit">{suffix}</span>}
    </div>
  </div>
);

export default InputField;
