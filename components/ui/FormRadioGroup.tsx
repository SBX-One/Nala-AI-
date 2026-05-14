import React from "react";

interface RadioOption {
  label: string;
  value: string;
}

interface FormRadioGroupProps {
  leftLabel?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  leftLabel,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {leftLabel && (
        <label className="text-label-small-medium text-text-heading">
          {leftLabel}
        </label>
      )}
      <div className="flex items-center gap-8">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="flex items-center gap-3 group"
            >
              <div
                className={`size-6 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected ? "border-primary-500 bg-primary-500 shadow-sm" : "border-primary-500/30 group-hover:border-primary-500/60"}`}
              >
                {isSelected && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                className={`text-label-base-medium transition-colors ${
                  isSelected ? "text-text-heading" : "text-text-placeholder"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
