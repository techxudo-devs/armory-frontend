interface EyebrowProps {
  children: React.ReactNode;
  withDot?: boolean;
  withLine?: boolean;
}

export function Eyebrow({ children, withDot = false, withLine = false }: EyebrowProps) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold text-brass-light tracking-widest uppercase">
      {withDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_0_3px_var(--color-signal-dim)]" />
      )}
      {withLine && <span className="w-6 h-px bg-brass" />}
      {children}
    </div>
  );
}
