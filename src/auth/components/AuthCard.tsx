import type { ReactNode } from "react";

interface AuthCardProps {
  badge?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({
  badge,
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-2xl bg-panel/90 backdrop-blur-md border border-border/80 rounded-2xl p-6 sm:p-7 shadow-black/60 relative overflow-hidden">
      {/* Subtle Premium Metallic Line Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brass/60 to-transparent" />

      {badge && (
        <span className="inline-block text-[10px] font-plus font-medium uppercase tracking-wider text-brass-light bg-brass/10 border border-brass/30 px-3 py-0.5 rounded-full mb-3">
          {badge}
        </span>
      )}
      <h1 className="font-plus text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
        {title}
      </h1>
      <p className="text-xs text-text-secondary font-plus mt-1 mb-5 leading-relaxed">
        {subtitle}
      </p>
      {children}
    </div>
  );
}