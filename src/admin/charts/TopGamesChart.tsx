'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface TopGameData {
  name: string
  seats: number
  fillRate: number
}

interface TopGamesChartProps {
  data: TopGameData[]
}

const BLUE = '#E53535'
const PURPLE = '#E68078'

export function TopGamesChart({ data }: TopGamesChartProps) {
  return (
    <div className="h-80 rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-5 shadow-xl shadow-black/20">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
        <h3 className="text-sm font-semibold tracking-wide text-[#F2F3F5]">Top Games</h3>
      </div>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="28%"
          >
            <defs>
              <linearGradient id="barPlays" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity={1} />
                <stop offset="100%" stopColor={BLUE} stopOpacity={0.35} />
              </linearGradient>
              <linearGradient id="barWin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PURPLE} stopOpacity={1} />
                <stop offset="100%" stopColor={PURPLE} stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tick={{ fill: '#9AA0AA', fontSize: 11 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9AA0AA', fontSize: 11 }}
              width={38}
            />
            <Tooltip
              content={<ChartTooltip formatter={(value, name) => (name === 'fillRate' ? `${value}%` : String(value))} />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: '#F2F3F5', paddingTop: 6 }}
            />
            <Bar dataKey="seats" name="Seats Reserved" fill="url(#barPlays)" radius={[6, 6, 0, 0]} maxBarSize={26} />
            <Bar dataKey="fillRate" name="Fill Rate" fill="url(#barWin)" radius={[6, 6, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
