interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Pill({ label, active = false, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-plus cursor-pointer font-medium px-5 py-2.5 border transition-colors ${
        active
          ? "bg-brass-dim border-brass text-brass-light"
          : "border-border-strong text-text-secondary hover:border-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}
