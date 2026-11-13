import { useState } from 'react'
import type { Data } from '../lib/useData'
import type { Transfer } from '../types'
import { dayLabel, defaultDate, euros, monthOf } from '../lib/dates'
import { monthSummary } from '../lib/summary'
import Row from './Row'
import CategoryBreakdown from './CategoryBreakdown'
import { card, deleteButton, input, label, primaryButton } from '../ui'

interface Props {
  month: string
  data: Data
}

function MonthView({ month, data }: Props) {
  const s = monthSummary(data, month)
  const monthTransfers = data.transfers
    .filter((t) => monthOf(t.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-4">
      <section className={card}>
        <h2 className="mb-2 text-lg font-semibold">Presupuesto del mes</h2>
        <dl className="space-y-1">
          <Row label="Sobrante del mes anterior" value={s.carry} />
          <Row label="Desde mi ahorro" value={s.fromSavings} sign="+" />
          {s.fromOthers > 0 && <Row label="Otros ingresos" value={s.fromOthers} sign="+" />}
          <div className="border-t border-slate-200 pt-1">
            <Row label="Presupuesto" value={s.budget} bold />
          </div>
          <Row label="Gastado" value={s.spent} sign="−" />
          <div className="border-t border-slate-200 pt-1">
            <Row label="Sobrante" hint="Pasa al mes siguiente" value={s.leftover} strong />
          </div>
        </dl>
      </section>

      <CategoryBreakdown bills={data.bills.filter((b) => monthOf(b.date) === month)} />

      <section className={card}>
        <h2 className="mb-2 text-lg font-semibold">Ahorro</h2>
        {/* key={month} so the salary input resets when switching months */}
        <SalaryForm key={month} initial={s.salary} onSave={(amount) => data.saveSalary(month, amount)} />
        <dl className="mt-3 space-y-1">
          {s.savedInSavings !== undefined && (
            <Row label="En la cuenta de ahorro" hint="Sueldo − lo que pasé a la corriente" value={s.savedInSavings} />
          )}
          <Row label="En la corriente" hint="Sobrante − sobrante del mes anterior" value={s.savedInChecking} />
          {s.savedInSavings !== undefined && (
            <div className="border-t border-slate-200 pt-1">
              <Row label="Ahorro total" value={s.savedInSavings + s.savedInChecking} strong />
            </div>
          )}
        </dl>
        {s.savedInSavings === undefined && (
          <p className="mt-1 text-sm text-slate-500">Apunta el sueldo para ver lo que queda en la cuenta de ahorro.</p>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-2 text-lg font-semibold">Dinero que entra</h2>
        <TransferForm key={month} month={month} data={data} />
        {monthTransfers.length === 0 && <p className="mt-3 text-slate-500">Ninguna este mes.</p>}
        <ul className="mt-2 divide-y divide-slate-100">
          {monthTransfers.map((t) => (
            <li key={t.id} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate">{t.note || (t.source === 'savings' ? 'Transferencia' : 'Ingreso')}</p>
                <p className="text-xs text-slate-500">
                  {dayLabel(t.date)} · {t.source === 'savings' ? 'Mi ahorro' : 'Otro ingreso'}
                </p>
              </div>
              <span className="font-medium text-emerald-700">+{euros(t.amount)}</span>
              <button type="button" className={deleteButton} onClick={() => data.deleteTransfer(t.id)}>Borrar</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function SalaryForm({ initial, onSave }: { initial?: number, onSave: (amount: number | null) => void }) {
  const [amount, setAmount] = useState(initial?.toString() ?? '')

  function save(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (amount === '') return onSave(null)
    const num = Number(amount)
    if (isNaN(num) || num < 0) return
    onSave(num)
  }

  return (
    <form onSubmit={save} className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="salary" className={label}>Sueldo de este mes (€)</label>
        <input id="salary" className={input} type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}/>
      </div>
      <button type="submit" className={primaryButton}>Guardar</button>
    </form>
  )
}

function TransferForm({ month, data }: Props) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(() => defaultDate(month))
  const [note, setNote] = useState("")
  const [source, setSource] = useState<Transfer['source']>('savings')
  const [saving, setSaving] = useState(false)

  async function addTransfer(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const num = Number(amount)
    if (isNaN(num) || num <= 0 || !date) return

    setSaving(true)
    const ok = await data.addTransfer({ amount: num, date, note: note.trim(), source })
    setSaving(false)
    if (!ok) return

    setAmount('')
    setNote('')
  }

  return (
    <form onSubmit={addTransfer} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="t-amount" className={label}>Importe (€)</label>
          <input id="t-amount" className={input} type="number" min="0.01" step="0.01" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)}/>
        </div>
        <div>
          <label htmlFor="t-date" className={label}>Fecha</label>
          <input id="t-date" className={input} type="date" required value={date} onChange={(e) => setDate(e.target.value)}/>
        </div>
      </div>
      <div>
        <label htmlFor="t-source" className={label}>De dónde viene</label>
        <select id="t-source" className={input} value={source} onChange={(e) => setSource(e.target.value as Transfer['source'])}>
          <option value="savings">Mi cuenta de ahorro</option>
          <option value="other">Otro ingreso (familia, Bizum...)</option>
        </select>
      </div>
      <div>
        <label htmlFor="t-note" className={label}>Nota</label>
        <input id="t-note" className={input} placeholder={source === 'savings' ? 'Mensual, extraordinario...' : 'Parte del alquiler...'} value={note} onChange={(e) => setNote(e.target.value)}/>
      </div>
      <button type="submit" className={`${primaryButton} w-full`} disabled={saving}>
        {saving ? 'Guardando...' : 'Añadir'}
      </button>
    </form>
  )
}

export default MonthView
