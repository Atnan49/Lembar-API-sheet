import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: "none" | "yellow" | "red" | "black";
}

export function Card({ className = "", accent = "none", children, ...props }: CardProps) {
  const accentStyles = {
    none: "",
    yellow: "border-t-[5px] border-t-[#ffe600]",
    red: "border-t-[5px] border-t-[#ff3b30]",
    black: "border-t-[5px] border-t-black",
  };

  return (
    <div
      className={`bg-white border-2 border-black rounded-none p-5 sm:p-6 shadow-[4px_4px_0px_#000000] ${accentStyles[accent]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b-2 border-black pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base sm:text-lg font-extrabold uppercase tracking-wider text-black ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs sm:text-sm text-zinc-700 mt-1 font-medium ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t-2 border-black pt-4 mt-5 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}
