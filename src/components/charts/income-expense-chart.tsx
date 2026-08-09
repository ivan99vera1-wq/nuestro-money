import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoneyCompact } from '@/lib/format'
import { useCouple } from '@/contexts/CoupleContext'

interface IncomeExpenseChartProps {
  data: { label: string; income: number; expense: number }[]
  height?: number
}

export function IncomeExpenseChart({ data, height = 260 }: IncomeExpenseChartProps) {
  const { couple } = useCouple()
  const currency = couple?.currency ?? 'EUR'

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={4}>
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
            formatter={(value, name) => [
              formatMoneyCompact(Number(value ?? 0), currency),
              name === 'income' ? 'Ingresos' : 'Gastos',
            ]}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend
            formatter={(value) => (value === 'income' ? 'Ingresos' : 'Gastos')}
            wrapperStyle={{ fontSize: 12, color: 'var(--ink-2)' }}
          />
          <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={22} />
          <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
