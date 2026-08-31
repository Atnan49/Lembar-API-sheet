import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "secondary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    // Neo-Brutalism variant styles
    const variantStyles = {
      primary:
        "bg-[#ffe600] text-black hover:bg-black hover:text-white active:bg-zinc-800 border-2 border-black shadow-[2px_2px_0px_#000000]",
      danger:
        "bg-[#ff3b30] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] border-2 border-black shadow-[2px_2px_0px_#000000]",
      secondary:
        "bg-white text-black hover:bg-zinc-100 active:bg-zinc-200 border-2 border-black shadow-[2px_2px_0px_#000000]",
      outline:
        "bg-transparent text-black hover:bg-black hover:text-white border-2 border-black shadow-[2px_2px_0px_#000000]",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs font-bold min-h-[38px] tracking-wide",
      md: "px-4 py-2.5 text-sm font-extrabold min-h-[44px] tracking-wider",
      lg: "px-6 py-3.5 text-base font-extrabold min-h-[50px] tracking-widest",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-none uppercase transition-all duration-100 select-none
          active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
          disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-x-0 disabled:active:translate-y-0
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-none" />
            <span>Memproses...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
