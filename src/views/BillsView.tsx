import { useState } from 'react'
import type { Data } from '../lib/useData'
import type { Bill } from '../types'
import { dayLabel, defaultDate, euros, monthOf } from '../lib/dates'
import { card, deleteButton, editButton, input, label, primaryButton } from '../ui'

interface Props {
  month: string
  data: Data
}

function BillsView({ month, data }: Props) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(() => defaultDate(month))
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const monthBills = data.bills
    .filter((bill) => monthOf(bill.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date))
  const total = monthBills.reduce((acumulado, bill) => acumulado + bill.amount, 0)

  async function addBill(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const num = Number(amount)

    if (isNaN(num) || num <= 0) return
    if (!date) return

    setSaving(true)
    const ok = await data.addBill({ amount: num, note: note.trim(), date, category: category || null })
    setSaving(false)
    if (!ok) return

    // Keep the date, I usually add a few expenses from the same day in a row
    setAmount('')
    setNote('')
    setCategory('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addBill} className={`${card} space-y-3`}>
        <h2 className="text-lg font-semibold">Nuevo gasto</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="amount" className={label}>Importe (€)</label>
            <input id="amount" className={input} value={amount} min="0.01" step="0.01" type="number" inputMode="decimal" required onChange={(e) => setAmount(e.target.value)}/>
          </div>
          <div>
            <label htmlFor="date" className={label}>Fecha</label>
            <input id="date" className={input} type="date" value={date} required onChange={(e) => setDate(e.target.value)}/>
          </div>
        </div>
        <div>
          <label htmlFor="note" className={label}>Nota</label>
          <input id="note" className={input} value={note} placeholder="Opcional" onChange={(e) => setNote(e.target.value)}/>
        </div>
        <div>
          <label htmlFor="category" className={label}>Categoría</label>
          <select id="category" className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Sin categoría</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={`${primaryButton} w-full`} disabled={saving}>
          {saving ? 'Guardando...' : 'Añadir'}
        </button>
      </form>

      <section className={card}>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Gastos del mes</h2>
          <span className="font-semibold">{euros(total)}</span>
        </div>
        {monthBills.length === 0 && <p className="text-slate-500">No hay gastos este mes.</p>}
        <ul className="divide-y divide-slate-100">
          {monthBills.map((g) => editingId === g.id ? (
            <li key={g.id} className="py-2">
              <EditBillForm bill={g} data={data} onClose={() => setEditingId(null)} />
            </li>
          ) : (
            <li key={g.id} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                {/* With no note, the category works as the title so it isn't shown twice */}
                <p className="truncate">{g.note || g.category || <span className="text-slate-400">Sin nota</span>}</p>
                <p className="text-xs text-slate-500">
                  {dayLabel(g.date)}{g.note && g.category && <> · {g.category}</>}
                </p>
              </div>
              <span className="font-medium">{euros(g.amount)}</span>
              <button type="button" className={editButton} onClick={() => setEditingId(g.id)}>Editar</button>
              <button type="button" className={deleteButton} onClick={() => data.deleteBill(g.id)}>Borrar</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function EditBillForm({ bill, data, onClose }: { bill: Bill, data: Data, onClose: () => void }) {
  const [amount, setAmount] = useState(bill.amount.toString())
  const [note, setNote] = useState(bill.note)
  const [date, setDate] = useState(bill.date)
  const [category, setCategory] = useState(bill.category ?? '')
  const [saving, setSaving] = useState(false)

  // Keep the bill's category in the list even if it was deleted, so saving doesn't drop it
  const names = data.categories.map((c) => c.name)
  if (bill.category && !names.includes(bill.category)) names.push(bill.category)

  async function save(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const num = Number(amount)
    if (isNaN(num) || num <= 0 || !date) return

    setSaving(true)
    const ok = await data.updateBill(bill.id, { amount: num, note: note.trim(), date, category: category || null })
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <form onSubmit={save} className="space-y-2 rounded-lg bg-slate-50 p-3">
      <div className="grid grid-cols-2 gap-2">
        <input className={input} aria-label="Importe" type="number" min="0.01" step="0.01" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)}/>
        <input className={input} aria-label="Fecha" type="date" required value={date} onChange={(e) => setDate(e.target.value)}/>
      </div>
      <input className={input} aria-label="Nota" placeholder="Nota" value={note} onChange={(e) => setNote(e.target.value)}/>
      <select className={input} aria-label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Sin categoría</option>
        {names.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" className={`${primaryButton} flex-1`} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="flex-1 rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default BillsView
