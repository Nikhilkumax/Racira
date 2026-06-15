"use client";

import { Check } from "lucide-react";

interface Step {
  label: string;
  number: number;
}

interface StepperProgressProps {
  currentStep: number;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { label: "Upload", number: 1 },
  { label: "Edit", number: 2 },
  { label: "Download", number: 3 },
];

const StepperProgress = ({ currentStep, steps = defaultSteps }: StepperProgressProps) => {
  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector line (background) */}
        <div className="absolute top-5 left-[15%] right-[15%] h-[2px] bg-border" />
        {/* Connector line (progress) */}
        <div
          className="absolute top-5 left-[15%] h-[2px] bg-primary transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 70)}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              {/* Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-500 ease-out
                  ${isCompleted
                    ? "bg-primary text-primary-foreground shadow-md scale-100"
                    : isActive
                      ? "bg-primary text-primary-foreground shadow-lg scale-110 ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground border-2 border-border"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 animate-scale-in" />
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors duration-300
                  ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepperProgress;
