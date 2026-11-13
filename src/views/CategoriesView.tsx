import { useState } from 'react'
import type { Data } from '../lib/useData'
import { card, deleteButton, input, primaryButton } from '../ui'

function CategoriesView({ data }: { data: Data }) {
  const [name, setName] = useState("")

  async function addCategory(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (await data.addCategory(trimmed)) setName('')
  }

  return (
    <section className={card}>
      <h2 className="mb-1 text-lg font-semibold">Categorías</h2>
      <p className="mb-3 text-sm text-slate-500">
        Solo para los gastos que quieras seguir. Borrar una categoría no borra sus gastos.
      </p>
      <form onSubmit={addCategory} className="mb-3 flex gap-2">
        <input className={input} placeholder="Nueva categoría" value={name} onChange={(e) => setName(e.target.value)}/>
        <button type="submit" className={primaryButton}>Añadir</button>
      </form>
      <ul className="divide-y divide-slate-100">
        {data.categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2">
            <span>{c.name}</span>
            <button type="button" className={deleteButton} onClick={() => data.deleteCategory(c.id)}>Borrar</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CategoriesView
