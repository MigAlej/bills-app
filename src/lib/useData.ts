import { useEffect, useState } from 'react'
import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Bill, Category, Salary, Transfer } from '../types'

const BILL_COLUMNS = 'id, amount, note, date, category'
const TRANSFER_COLUMNS = 'id, amount, note, date, source'

// numeric columns can come back as strings, so make sure they're numbers
function toBill(row: Bill): Bill {
  return { ...row, amount: Number(row.amount), note: row.note ?? '' }
}

function toTransfer(row: Transfer): Transfer {
  return { ...row, amount: Number(row.amount), note: row.note ?? '' }
}

// Loads everything once after login and exposes the functions that change it
export function useData(userId: string) {
  const [bills, setBills] = useState<Bill[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [b, t, s, c] = await Promise.all([
        supabase.from('bills').select(BILL_COLUMNS).order('date'),
        supabase.from('transfers').select(TRANSFER_COLUMNS).order('date'),
        supabase.from('salaries').select('month, amount'),
        supabase.from('categories').select('id, name').order('name'),
      ])
      const failed = [b, t, s, c].find((r) => r.error)
      if (failed?.error) setError(failed.error.message)

      setBills((b.data ?? []).map(toBill))
      setTransfers((t.data ?? []).map(toTransfer))
      setSalaries((s.data ?? []).map((row) => ({ month: row.month.slice(0, 7), amount: Number(row.amount) })))
      setCategories(c.data ?? [])
      setLoading(false)
    }
    load()
  }, [userId])

  // Returns false on error so the form knows not to clear itself
  function check(error: PostgrestError | null) {
    if (error) {
      setError(error.message)
      return false
    }
    setError('')
    return true
  }

  async function addBill(bill: Omit<Bill, 'id'>) {
    const { data, error } = await supabase.from('bills').insert(bill).select(BILL_COLUMNS).single()
    if (!check(error) || !data) return false
    setBills((prev) => [...prev, toBill(data)])
    return true
  }

  async function updateBill(id: string, changes: Partial<Omit<Bill, 'id'>>) {
    const { data, error } = await supabase.from('bills').update(changes).eq('id', id).select(BILL_COLUMNS).single()
    if (!check(error) || !data) return false
    setBills((prev) => prev.map((bill) => (bill.id === id ? toBill(data) : bill)))
    return true
  }

  async function deleteBill(id: string) {
    const { error } = await supabase.from('bills').delete().eq('id', id)
    if (check(error)) setBills((prev) => prev.filter((bill) => bill.id !== id))
  }

  async function addTransfer(transfer: Omit<Transfer, 'id'>) {
    const { data, error } = await supabase.from('transfers').insert(transfer).select(TRANSFER_COLUMNS).single()
    if (!check(error) || !data) return false
    setTransfers((prev) => [...prev, toTransfer(data)])
    return true
  }

  async function deleteTransfer(id: string) {
    const { error } = await supabase.from('transfers').delete().eq('id', id)
    if (check(error)) setTransfers((prev) => prev.filter((t) => t.id !== id))
  }

  // Passing null removes that month's salary
  async function saveSalary(month: string, amount: number | null) {
    const others = (prev: Salary[]) => prev.filter((s) => s.month !== month)
    if (amount === null) {
      const { error } = await supabase.from('salaries').delete().eq('month', `${month}-01`)
      if (check(error)) setSalaries(others)
      return
    }
    const { error } = await supabase
      .from('salaries')
      .upsert({ user_id: userId, month: `${month}-01`, amount }, { onConflict: 'user_id,month' })
    if (check(error)) setSalaries((prev) => [...others(prev), { month, amount }])
  }

  async function addCategory(name: string) {
    const { data, error } = await supabase.from('categories').insert({ name }).select('id, name').single()
    if (!check(error) || !data) return false
    setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return true
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (check(error)) setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    bills, transfers, salaries, categories, loading, error,
    addBill, updateBill, deleteBill, addTransfer, deleteTransfer, saveSalary, addCategory, deleteCategory,
  }
}

export type Data = ReturnType<typeof useData>
