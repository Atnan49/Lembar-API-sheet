import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "yellow" | "red" | "black" | "white" | "zinc";
}

export function Badge({ className = "", variant = "white", children, ...props }: BadgeProps) {
  const variantStyles = {
    yellow: "bg-[#ffe600] text-black border-black",
    red: "bg-[#ff3b30] text-white border-black",
    black: "bg-black text-white border-black",
    white: "bg-white text-black border-black",
    zinc: "bg-zinc-100 text-zinc-900 border-black",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider rounded-none border-2 shadow-[1px_1px_0px_#000000] select-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
