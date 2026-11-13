import { useState } from 'react'
import type { Bill } from '../types'
import { dayLabel, daysInMonth, euros, firstWeekday, monthOf, today } from '../lib/dates'
import { card } from '../ui'

interface Props {
  month: string
  bills: Bill[]
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// The more I spent that day compared to the worst day of the month, the darker it gets
const SHADES = ['bg-rose-50 text-rose-900', 'bg-rose-100 text-rose-900', 'bg-rose-200 text-rose-900', 'bg-rose-300 text-rose-950']

function shade(total: number, max: number) {
  const level = Math.min(SHADES.length - 1, Math.floor((total / max) * SHADES.length))
  return SHADES[level]
}

function CalendarView({ month, bills }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  // Total spent per day, e.g. { '2026-11-03': 42.5 }
  const totals = new Map<string, number>()
  for (const bill of bills) {
    if (monthOf(bill.date) !== month) continue
    totals.set(bill.date, (totals.get(bill.date) ?? 0) + bill.amount)
  }

  const days = Array.from({ length: daysInMonth(month) }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
  const blanks = firstWeekday(month)
  const monthTotal = [...totals.values()].reduce((acumulado, n) => acumulado + n, 0)
  const maxDay = Math.max(0, ...totals.values())
  const todayDate = today()

  const dayBills = bills.filter((bill) => bill.date === selected)
  const byCategory = new Map<string, number>()
  for (const bill of dayBills) {
    const name = bill.category ?? 'Sin categoría'
    byCategory.set(name, (byCategory.get(name) ?? 0) + bill.amount)
  }

  return (
    <div className="space-y-4">
      <section className={card}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Gastado este mes</h2>
          <span className="font-semibold">{euros(monthTotal)}</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-xs font-medium text-slate-500">{d}</div>
          ))}
          {Array.from({ length: blanks }, (_, i) => <div key={`blank-${i}`} />)}
          {days.map((day) => {
            const total = totals.get(day)
            const isSelected = day === selected
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(isSelected ? null : day)}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm ${
                  total ? shade(total, maxDay) : 'hover:bg-slate-100'
                } ${isSelected ? 'ring-2 ring-slate-900' : ''} ${day === todayDate ? 'font-bold' : ''}`}
              >
                <span>{Number(day.slice(8))}</span>
                {total !== undefined && (
                  <span className="text-[10px] leading-tight">{Math.round(total)}€</span>
                )}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-slate-500">
          <span>Menos gasto</span>
          {SHADES.map((s) => <span key={s} className={`h-3 w-3 rounded ${s}`} />)}
          <span>Más gasto</span>
        </div>
      </section>

      {selected && monthOf(selected) === month && (
        <section className={card}>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold capitalize">{dayLabel(selected)}</h2>
            <span className="font-semibold">{euros(totals.get(selected) ?? 0)}</span>
          </div>
          {dayBills.length === 0 && <p className="text-slate-500">No hay gastos este día.</p>}
          <ul className="divide-y divide-slate-100">
            {[...byCategory].map(([name, total]) => (
              <li key={name} className="py-2">
                <div className="flex justify-between">
                  <span className="font-medium">{name}</span>
                  <span>{euros(total)}</span>
                </div>
                <ul className="text-sm text-slate-500">
                  {dayBills.filter((b) => (b.category ?? 'Sin categoría') === name).map((b) => (
                    <li key={b.id} className="flex justify-between">
                      <span>{b.note || 'Sin nota'}</span>
                      <span>{euros(b.amount)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default CalendarView
