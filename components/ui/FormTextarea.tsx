import React, { TextareaHTMLAttributes } from "react";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  leftLabel?: string;
  rightLabel?: string;
  id: string;
  footer?: React.ReactNode;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  leftLabel,
  id,
  rightLabel,
  footer,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-label-small-medium text-text-heading"
        >
          {leftLabel}
        </label>
        {rightLabel && (
          <label
            htmlFor={id}
            className="text-label-small-medium text-text-heading"
          >
            {rightLabel}
          </label>
        )}
      </div>
      <div className="relative">
        <textarea
          id={id}
          className={`w-full px-4 py-3.5 rounded-xl border border-border-default bg-white text-label-base-medium text-text-heading placeholder:text-text-placeholder focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all shadow-xs resize-none h-fit field-sizing-content ${className}`}
          {...props}
        />
        {footer && <div className="mt-1 flex justify-end">{footer}</div>}
      </div>
    </div>
  );
};
