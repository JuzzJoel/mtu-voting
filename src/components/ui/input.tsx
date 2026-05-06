import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: "default" | "otp";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      error,
      icon,
      variant = "default",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "w-full rounded-none border transition-all duration-150 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-0";

    const defaultStyles = `border-gray-300 px-4 py-2.5 ${icon ? "pl-10" : ""}`;

    const otpStyles =
      "w-12 h-12 text-center text-xl font-bold border-gray-300 focus:border-black focus:ring-0";

    const containerClass = `relative ${icon ? "flex items-center" : ""}`;

    const inputClass =
      variant === "otp"
        ? `${baseStyles} ${otpStyles} ${className}`
        : `${baseStyles} ${defaultStyles} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className={containerClass}>
          {icon && (
            <div className="absolute left-3 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClass}
            disabled={disabled}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-600 text-xs mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
