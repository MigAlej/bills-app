import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Login from './login'
import { supabase } from './lib/supabase'
import { useData } from './lib/useData'
import { addMonths, monthLabel, monthOf, today } from './lib/dates'
import BillsView from './views/BillsView'
import CalendarView from './views/CalendarView'
import MonthView from './views/MonthView'
import YearView from './views/YearView'
import CategoriesView from './views/CategoriesView'

const TABS = [
  { id: 'gastos', label: 'Gastos' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'mes', label: 'Mes' },
  { id: 'año', label: 'Año' },
  { id: 'categorias', label: 'Categorías' },
] as const

type Tab = (typeof TABS)[number]['id']

function App() {
  const [session, setSession] = useState<Session | null>(null)
  // Render nothing until Supabase knows if there's a saved session, otherwise the login flashes on reload
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setChecking(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (checking) return null
  if (!session) return <Login />
  return <Home userId={session.user.id} />
}

function Home({ userId }: { userId: string }) {
  const data = useData(userId)
  const [month, setMonth] = useState(() => monthOf(today()))
  const [tab, setTab] = useState<Tab>('gastos')

  const showMonthNav = tab === 'gastos' || tab === 'calendario' || tab === 'mes'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mis Gastos</h1>
          <button type="button" className="rounded-lg px-3 py-1 text-sm text-slate-600 hover:bg-slate-200" onClick={() => supabase.auth.signOut()}>
            Salir
          </button>
        </header>

        <nav className="grid grid-cols-5 gap-1 rounded-xl bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-1 py-2 text-xs font-medium sm:text-sm ${tab === t.id ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {showMonthNav && (
          <div className="flex items-center justify-between">
            <button type="button" className="rounded-lg px-3 py-1 text-xl hover:bg-slate-200" onClick={() => setMonth(addMonths(month, -1))} aria-label="Mes anterior">‹</button>
            <button type="button" className="text-lg font-semibold capitalize" onClick={() => setMonth(monthOf(today()))} title="Ir al mes actual">
              {monthLabel(month)}
            </button>
            <button type="button" className="rounded-lg px-3 py-1 text-xl hover:bg-slate-200" onClick={() => setMonth(addMonths(month, 1))} aria-label="Mes siguiente">›</button>
          </div>
        )}

        {data.error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Error: {data.error}</p>
        )}

        {data.loading ? (
          <p className="text-center text-slate-500">Cargando...</p>
        ) : (
          <>
            {/* key={month} remounts the forms when the month changes, so their date resets */}
            {tab === 'gastos' && <BillsView key={month} month={month} data={data} />}
            {tab === 'calendario' && <CalendarView month={month} bills={data.bills} />}
            {tab === 'mes' && <MonthView month={month} data={data} />}
            {tab === 'año' && (
              <YearView
                year={Number(month.slice(0, 4))}
                data={data}
                onChangeYear={(year) => setMonth(`${year}${month.slice(4)}`)}
                onOpenMonth={(m) => { setMonth(m); setTab('mes') }}
              />
            )}
            {tab === 'categorias' && <CategoriesView data={data} />}
          </>
        )}
      </div>
    </div>
  )
}

export default App
