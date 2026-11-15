import { useState } from 'react'
import type { Data } from '../lib/useData'
import { monthOf, shortMonthLabel } from '../lib/dates'
import { card } from '../ui'

interface Props {
  year: number
  data: Data
  onOpenMonth: (month: string) => void
}

const STORAGE_KEY = 'year-categories'

// The chosen categories are remembered in this browser only
function loadSelected(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function saveSelected(selected: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
  } catch {
    // Not being able to remember the choice isn't worth an error
  }
}

// Whole euros, like the other year table
function short(n: number) {
  return Math.round(n).toLocaleString('es-ES', { useGrouping: 'always' })
}

function YearCategories({ year, data, onOpenMonth }: Props) {
  const [selected, setSelected] = useState<string[]>(loadSelected)

  const yearBills = data.bills.filter((b) => b.date.startsWith(`${year}-`) && b.category)

  // Every category in the list, plus any used this year that has since been deleted
  const names = [...new Set([...data.categories.map((c) => c.name), ...yearBills.map((b) => b.category!)])].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
  const columns = names.filter((name) => selected.includes(name))

  function toggle(name: string) {
    const next = selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]
    setSelected(next)
    saveSelected(next)
  }

  // totals.get('2026-04')?.get('Mercado') = what went to Mercado in April
  const totals = new Map<string, Map<string, number>>()
  for (const bill of yearBills) {
    const month = monthOf(bill.date)
    const byCategory = totals.get(month) ?? new Map<string, number>()
    byCategory.set(bill.category!, (byCategory.get(bill.category!) ?? 0) + bill.amount)
    totals.set(month, byCategory)
  }

  // Only months with some bill count, so empty or future months don't pull the average down
  const activeMonths = new Set(data.bills.filter((b) => b.date.startsWith(`${year}-`)).map((b) => monthOf(b.date)))
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`)

  const yearTotal = (name: string) => months.reduce((acumulado, m) => acumulado + (totals.get(m)?.get(name) ?? 0), 0)

  return (
    <section className={card}>
      <h2 className="mb-2 text-lg font-semibold">Por categoría</h2>

      {names.length === 0 ? (
        <p className="text-slate-500">Todavía no hay categorías.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {names.map((name) => {
            const on = selected.includes(name)
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(name)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  on ? 'border-slate-700 bg-slate-700 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      {columns.length === 0 ? (
        names.length > 0 && <p className="mt-3 text-sm text-slate-500">Elige una o varias categorías para ver lo gastado cada mes.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1 font-medium">Mes</th>
                {columns.map((name) => (
                  <th key={name} className="py-1 pl-2 text-right font-medium">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {months.map((m) => (
                <tr key={m} className="cursor-pointer hover:bg-slate-50" onClick={() => onOpenMonth(m)}>
                  <td className="py-2 capitalize">{shortMonthLabel(m)}</td>
                  {columns.map((name) => {
                    const value = totals.get(m)?.get(name)
                    return (
                      <td key={name} className="py-2 pl-2 text-right">
                        {value !== undefined ? short(value) : activeMonths.has(m) ? '0' : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-300">
              <tr className="font-semibold">
                <td className="py-2">Total</td>
                {columns.map((name) => (
                  <td key={name} className="py-2 pl-2 text-right">
                    {short(yearTotal(name))}
                  </td>
                ))}
              </tr>
              <tr className="text-slate-500">
                <td className="py-1">Media</td>
                {columns.map((name) => (
                  <td key={name} className="py-1 pl-2 text-right">
                    {activeMonths.size > 0 ? short(yearTotal(name) / activeMonths.size) : '—'}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
          <p className="mt-2 text-xs text-slate-400">
            Importes en euros. La media es por mes con gastos apuntados. Pulsa un mes para ver su detalle.
          </p>
        </div>
      )}
    </section>
  )
}

export default YearCategories
