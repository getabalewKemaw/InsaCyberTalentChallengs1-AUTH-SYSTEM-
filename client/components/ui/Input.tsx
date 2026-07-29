import React, { useId } from "react";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[#594F4F] tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-white border ${error ? "border-red-500 text-red-900" : "border-[#E8E2D9] text-[#554236]"
          } rounded-lg text-sm placeholder:text-[#594F4F]/50 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-400" : "focus:ring-[#BFB35A] focus:border-[#BFB35A]"
          } transition-colors ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#594F4F]">{helperText}</p>
      ) : null}
    </div>
  );
}
