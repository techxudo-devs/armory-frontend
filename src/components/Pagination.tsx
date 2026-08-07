"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalDocs: number;
  pageSize: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  label?: string;
}

export function Pagination({
  page,
  totalPages,
  totalDocs,
  pageSize,
  isFetching = false,
  onPageChange,
  label = "items",
}: PaginationProps) {
  if (!totalDocs) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalDocs);

  return (
    <div className="flex flex-col gap-3 border-t border-[#1F293D] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[#8B93A7]">
        Showing{" "}
        <span className="font-semibold text-[#F2F3F5]">
          {start}–{end}
        </span>{" "}
        of <span className="font-semibold text-[#F2F3F5]">{totalDocs}</span> {label}
      </p>
      <div className="flex items-center justify-end gap-2">
        <span className="mr-1 text-xs text-[#8B93A7]">
          Page{" "}
          <span className="font-semibold text-[#F2F3F5]">
            {page} of {totalPages}
          </span>
        </span>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || isFetching}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#1F293D] bg-[#0F1422] px-3 py-2 text-sm font-medium text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} />
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || isFetching}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#1F293D] bg-[#0F1422] px-3 py-2 text-sm font-medium text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
