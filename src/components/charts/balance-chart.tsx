import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoneyCompact } from '@/lib/format'
import { useCouple } from '@/contexts/CoupleContext'

interface BalanceChartProps {
  data: { label: string; balance: number }[]
  height?: number
}

export function BalanceChart({ data, height = 260 }: BalanceChartProps) {
  const { couple } = useCouple()
  const currency = couple?.currency ?? 'EUR'

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1dcf8c" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1dcf8c" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--ink-3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--ink-3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={54}
            tickFormatter={(v: number) => formatMoneyCompact(v, currency)}
          />
          <Tooltip
            formatter={(value) => [formatMoneyCompact(Number(value ?? 0), currency), 'Saldo']}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#1dcf8c"
            strokeWidth={2.5}
            fill="url(#balanceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
