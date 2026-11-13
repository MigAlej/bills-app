import { useState } from 'react'
import type { Bill } from '../types'
import { dayLabel, euros } from '../lib/dates'
import { card } from '../ui'

interface Group {
  category: string | null
  total: number
}

// Bills already filtered to the month
function CategoryBreakdown({ bills }: { bills: Bill[] }) {
  // undefined = nothing open, null = the uncategorized group
  const [open, setOpen] = useState<string | null | undefined>(undefined)

  const totals = new Map<string, number>()
  let uncategorized = 0
  for (const bill of bills) {
    if (!bill.category) uncategorized += bill.amount
    else totals.set(bill.category, (totals.get(bill.category) ?? 0) + bill.amount)
  }

  // Biggest categories first, everything without a category at the end
  const groups: Group[] = [...totals]
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({ category, total }))
  if (uncategorized > 0) groups.push({ category: null, total: uncategorized })

  const max = Math.max(0, ...groups.map((g) => g.total))
  const spent = uncategorized + [...totals.values()].reduce((acumulado, n) => acumulado + n, 0)

  return (
    <section className={card}>
      <h2 className="mb-2 text-lg font-semibold">Por categoría</h2>
      {groups.length === 0 && <p className="text-slate-500">No hay gastos este mes.</p>}
      <ul className="space-y-2">
        {groups.map(({ category, total }) => {
          const isOpen = category === open
          return (
            <li key={category ?? ''}>
              {/* Tap a category to see its bills, tap again to close */}
              <button type="button" className="block w-full text-left" onClick={() => setOpen(isOpen ? undefined : category)} aria-expanded={isOpen}>
                <div className="flex justify-between text-sm">
                  <span className={category ? '' : 'text-slate-500'}>
                    <span className="inline-block w-4 text-slate-400">{isOpen ? '▾' : '▸'}</span>
                    {category ?? 'Sin categoría'}
                  </span>
                  <span className="font-medium">{euros(total)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${category ? 'bg-slate-500' : 'bg-slate-300'}`} style={{ width: `${(total / max) * 100}%` }} />
                </div>
              </button>
              {isOpen && (
                <ul className="mt-2 ml-4 divide-y divide-slate-100 rounded-lg bg-slate-50 px-3 text-sm">
                  {bills
                    .filter((b) => (b.category ?? null) === category)
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((b) => (
                      <li key={b.id} className="flex justify-between gap-2 py-1.5">
                        <span className="min-w-0 truncate">
                          <span className="text-slate-500">{dayLabel(b.date)}</span>
                          {b.note && <> · {b.note}</>}
                        </span>
                        <span className="whitespace-nowrap">{euros(b.amount)}</span>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      {groups.length > 0 && (
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 font-semibold">
          <span>Total gastado</span>
          <span>{euros(spent)}</span>
        </div>
      )}
    </section>
  )
}

export default CategoryBreakdown
