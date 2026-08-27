import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Color = "verde" | "amarillo" | "rojo" | "gris" | "azul";

const colorClasses: Record<Color, string> = {
  verde: "bg-emerald-100 text-emerald-800",
  amarillo: "bg-amber-100 text-amber-800",
  rojo: "bg-red-100 text-red-800",
  gris: "bg-slate-100 text-slate-700",
  azul: "bg-blue-100 text-blue-800",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
}

export function Badge({ className, color = "gris", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        colorClasses[color],
        className
      )}
      {...props}
    />
  );
}
