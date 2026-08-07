"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
}

export function Field({ label, type = "text", icon, ...props }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;
  const Icon = icon ?? (isPassword ? Lock : undefined);

  return (
    <label className="block">
      <span className="block text-[10px] font-plus font-bold uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </span>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        )}
        <input
          type={inputType}
          className={`w-full bg-bg-raised border border-border-strong/80 rounded-lg text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass/30 transition-all ${
            isPassword ? "pr-9" : "pr-3"
          } ${Icon ? "pl-9" : "pl-3"} py-2.5`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </label>
  );
}