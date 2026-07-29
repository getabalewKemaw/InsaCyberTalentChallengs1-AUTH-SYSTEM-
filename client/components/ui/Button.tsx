import React from "react";
import Loader from "./loader";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-[#BFB35A] text-[#554236] hover:bg-[#A89C4A] focus:ring-[#BFB35A] shadow-xs active:scale-[0.99]",
    secondary:
      "bg-[#554236] text-[#FBF9F6] hover:bg-[#43342A] focus:ring-[#554236] shadow-xs active:scale-[0.99]",
    outline:
      "border border-[#E8E2D9] bg-white text-[#554236] hover:bg-[#FBF9F6] hover:border-[#BFB35A] focus:ring-[#BFB35A]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-xs active:scale-[0.99]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""
        } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader />
      ) : (
        children
      )}
    </button>
  );
}
