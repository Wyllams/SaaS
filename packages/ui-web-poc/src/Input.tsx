import type { InputHTMLAttributes } from "react";
import { useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Input({
  label,
  helperText,
  error,
  id,
  required,
  className = "",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="text-[13px] font-medium text-text">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={helperText || error ? descriptionId : undefined}
        className={[
          "min-h-10 w-full rounded-[var(--cc-radius-input)] border bg-surface px-3 text-sm text-text",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
          error ? "border-red-600" : "border-border",
          className,
        ].join(" ")}
      />
      {helperText || error ? (
        <p
          id={descriptionId}
          role={error ? "alert" : undefined}
          className={error ? "text-xs text-red-700" : "text-xs text-text-muted"}
        >
          {error ?? helperText}
        </p>
      ) : null}
    </div>
  );
}
