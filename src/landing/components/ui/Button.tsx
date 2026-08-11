import type { AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "btn-gold border border-brass-light/40 text-[#241409] hover:brightness-110",
  outline:
    "border border-border-strong text-text-primary hover:border-brass hover:text-brass-light",
  ghost:
    "border-b border-border-strong text-text-primary hover:border-brass px-1"
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <a
      className={`inline-block font-semibold text-xs font-plus tracking-wide uppercase px-6 py-4 transition-colors duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
