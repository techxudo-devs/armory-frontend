interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Pill({ label, active = false, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-plus cursor-pointer font-medium px-5 py-2.5 border transition-colors duration-300 ${
        active
          ? "bg-gradient-to-r from-[#D29A45] to-[#E3C49A] border-transparent text-[#1a1408] shadow-sm shadow-[#D29A45]/30"
          : "border-[#E0CBA4] text-[#A96E1F] hover:border-[#A96E1F] hover:text-[#6f4510]"
      }`}
    >
      {label}
    </button>
  );
}
