'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface GameData {
  name: string
  value: number
}

interface GameDistributionChartProps {
  data: GameData[]
}

const COLORS = ['#C78C3A', '#D0AE95', '#7E9C6B', '#D08A5A']

export function GameDistributionChart({ data }: GameDistributionChartProps) {
  return (
    <div className="h-80 rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D0AE95]" />
        <h3 className="text-sm font-semibold tracking-wide text-[#F2E8DC]">Game Distribution</h3>
      </div>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <Pie
              data={data}
              cx="50%"
              cy="47%"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={3}
              cornerRadius={5}
              labelLine={false}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#F2E8DC', paddingTop: 4 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
