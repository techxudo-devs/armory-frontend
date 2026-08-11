interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  formatter?: (value: number | string, name: string) => string
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl border border-[#3D2715] bg-[#150A06]/95 px-3.5 py-2.5 shadow-2xl shadow-black/50 backdrop-blur">
      {label ? (
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-[#C09A76]">{label}</p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#C09A76]">{entry.name}</span>
            <span className="ml-3 font-semibold tabular-nums text-[#F4EADD]">
              {formatter
                ? formatter(entry.value ?? '', entry.name ?? '')
                : String(entry.value ?? '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
