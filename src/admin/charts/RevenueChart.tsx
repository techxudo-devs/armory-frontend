'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface DataPoint {
  month: string
  seats: number
  games: number
}

interface RevenueChartProps {
  data: DataPoint[]
}

const BLUE = '#C78C3A'
const PURPLE = '#D0AE95'

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-80 rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C78C3A]" />
        <h3 className="text-sm font-semibold tracking-wide text-[#F2E8DC]">Monthly Engagement</h3>
      </div>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={BLUE} stopOpacity={1} />
                <stop offset="100%" stopColor={PURPLE} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tick={{ fill: '#B08A6C', fontSize: 11 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#B08A6C', fontSize: 11 }}
              width={38}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeDasharray: '4 4' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: '#F2E8DC', paddingTop: 6 }}
            />
            <Line
              type="monotone"
              dataKey="seats"
              name="Seats Reserved"
              stroke="url(#revLine)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: BLUE, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="games"
              name="New Games"
              stroke={PURPLE}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 5, fill: PURPLE, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
