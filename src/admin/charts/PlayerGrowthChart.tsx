'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface GrowthData {
  month: string
  newPlayers: number
  activeUsers: number
}

interface PlayerGrowthChartProps {
  data: GrowthData[]
}

const GREEN = '#7E9C6B'
const ORANGE = '#D08A5A'

export function PlayerGrowthChart({ data }: PlayerGrowthChartProps) {
  return (
    <div className="h-80 rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#7E9C6B]" />
        <h3 className="text-sm font-semibold tracking-wide text-[#F2E8DC]">Player Growth</h3>
      </div>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="growthNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity={0.5} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="growthActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ORANGE} stopOpacity={0.5} />
                <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
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
            <Area
              type="monotone"
              dataKey="newPlayers"
              stackId="1"
              stroke={GREEN}
              strokeWidth={2}
              fill="url(#growthNew)"
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              stackId="1"
              stroke={ORANGE}
              strokeWidth={2}
              fill="url(#growthActive)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
