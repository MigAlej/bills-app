import type { Data } from '../lib/useData'
import { monthOf, shortMonthLabel, today } from '../lib/dates'
import { monthSummary } from '../lib/summary'
import Row from './Row'
import { card } from '../ui'

interface Props {
  year: number
  data: Data
  onChangeYear: (year: number) => void
  onOpenMonth: (month: string) => void
}

// Whole euros, the table doesn't fit cents on a phone
function short(n: number) {
  return Math.round(n).toLocaleString('es-ES', { useGrouping: 'always' })
}

function YearView({ year, data, onChangeYear, onOpenMonth }: Props) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, '0')}`
    return { month, ...monthSummary(data, month) }
  })

  const currentMonth = monthOf(today())

  const total = (pick: (m: (typeof months)[number]) => number) =>
    months.reduce((acumulado, m) => acumulado + pick(m), 0)

  const salary = total((m) => m.salary ?? 0)
  const spent = total((m) => m.spent)
  const savedInSavings = total((m) => m.savedInSavings ?? 0)
  const savedInChecking = total((m) => m.savedInChecking)

  // Months with activity but no salary would make the savings look smaller than they are
  const missingSalary = months.some((m) => m.salary === undefined && (m.spent > 0 || m.transferred > 0))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button type="button" className="rounded-lg px-3 py-1 text-xl hover:bg-slate-200" onClick={() => onChangeYear(year - 1)} aria-label="Año anterior">‹</button>
        <h2 className="text-lg font-semibold">{year}</h2>
        <button type="button" className="rounded-lg px-3 py-1 text-xl hover:bg-slate-200" onClick={() => onChangeYear(year + 1)} aria-label="Año siguiente">›</button>
      </div>

      <section className={card}>
        <h2 className="mb-2 text-lg font-semibold">Resumen del año</h2>
        <dl className="space-y-1">
          <Row label="Sueldo" value={salary} />
          <Row label="Gastado" value={spent} />
          <div className="space-y-1 border-t border-slate-200 pt-1">
            <Row label="Ahorro en cuenta de ahorro" value={savedInSavings} />
            <Row label="Ahorro en corriente" value={savedInChecking} />
            <Row label="Ahorro total" value={savedInSavings + savedInChecking} strong />
          </div>
        </dl>
        {missingSalary && (
          <p className="mt-2 text-sm text-slate-500">Hay meses sin sueldo apuntado: no cuentan en el ahorro de la cuenta de ahorro.</p>
        )}
      </section>

      <section className={card}>
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-1 font-medium">Mes</th>
              <th className="py-1 text-right font-medium">Presup.</th>
              <th className="py-1 text-right font-medium">Gastado</th>
              <th className="py-1 text-right font-medium">Sobrante</th>
              <th className="py-1 text-right font-medium">Ahorro cta.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {months.map((m) => {
              // Months that haven't started yet would only repeat the carry
              const future = m.month > currentMonth && m.spent === 0 && m.transferred === 0
              return (
                <tr key={m.month} className="cursor-pointer hover:bg-slate-50" onClick={() => onOpenMonth(m.month)}>
                  <td className="py-2 capitalize">{shortMonthLabel(m.month)}</td>
                  <td className="py-2 text-right">{future ? '—' : short(m.budget)}</td>
                  <td className="py-2 text-right">{future ? '—' : short(m.spent)}</td>
                  <td className={`py-2 text-right ${m.leftover < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{future ? '—' : short(m.leftover)}</td>
                  {/* No salary entered means there's nothing to show here */}
                  <td className={`py-2 text-right ${m.savedInSavings !== undefined && m.savedInSavings < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {m.savedInSavings === undefined ? '—' : short(m.savedInSavings)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-400">
          Importes en euros. "Ahorro cta." es lo que quedó en la cuenta de ahorro. Pulsa un mes para ver su detalle.
        </p>
      </section>
    </div>
  )
}

export default YearView
