import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-extrabold uppercase tracking-wider text-black">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full bg-white text-black font-medium text-sm px-3.5 py-2.5 min-h-[44px] rounded-none border-2 border-black
            shadow-[2px_2px_0px_#000000] transition-all
            placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 focus:translate-x-[-1px] focus:translate-y-[-1px]
            disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed
            ${error ? "border-[#ff3b30] ring-1 ring-[#ff3b30]" : ""}
            ${className}`}
          {...props}
        />
        {error && <p className="text-xs font-bold text-[#ff3b30] mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-zinc-600 font-medium">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
