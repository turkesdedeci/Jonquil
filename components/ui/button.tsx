import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
};

export function Button({ variant = "solid", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-medium tracking-[0.14em] transition " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-40 disabled:pointer-events-none";

  const styles: Record<string, string> = {
    // Flat luxury: düz, sakin, hafif hover
    solid:
      "bg-black text-white hover:bg-black/90 active:bg-black/80",
    outline:
      "bg-transparent text-neutral-900 border border-black/15 hover:bg-black/5 active:bg-black/8",
    ghost:
      "bg-transparent text-neutral-900 hover:bg-black/5 active:bg-black/8",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
