import { AlertCircle, CheckCircle2 } from "lucide-react";
import React, { forwardRef, useId } from "react";

export type FieldState = "idle" | "valid" | "invalid";

type Props = {
  label: string;
  error?: string;
  hint?: string;
  state?: FieldState;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

/**
 * FormField — labelled input with validation states, icons, and error/hint text.
 *
 * Usage:
 *   <FormField label="Email" type="email" state="invalid" error="Invalid email address" />
 */
const FormField = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      error,
      hint,
      state = "idle",
      required,
      prefix,
      suffix,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const borderClass =
      state === "invalid"
        ? "border-rose-400 focus:ring-rose-400"
        : state === "valid"
          ? "border-emerald-400 focus:ring-emerald-400"
          : "border-slate-200 focus:ring-indigo-500";

    const inlineIcon =
      state === "invalid" ? (
        <AlertCircle className="h-4 w-4 text-rose-500" />
      ) : state === "valid" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : null;

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 select-none"
        >
          {label}
          {required && (
            <span className="ml-1 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 flex items-center text-slate-400 pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            aria-required={required}
            aria-invalid={state === "invalid"}
            aria-describedby={
              [error && errorId, hint && hintId].filter(Boolean).join(" ") ||
              undefined
            }
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 ${borderClass} ${prefix ? "pl-10" : ""} ${suffix || inlineIcon ? "pr-10" : ""}`}
            {...rest}
          />

          {(suffix || inlineIcon) && (
            <span className="absolute right-3 flex items-center text-slate-400 pointer-events-none">
              {inlineIcon ?? suffix}
            </span>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1 text-xs text-rose-600"
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";
export default FormField;
