import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  loading = false,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-brass via-brass-light to-brass border border-brass text-[#fff] font-plus font-medium text-xs tracking-wide uppercase px-6 py-3 rounded-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-brass/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Please wait...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
