import React from "react";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-black/10 bg-white ${className}`} {...props} />;
}

export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 ${className}`} {...props} />;
}
