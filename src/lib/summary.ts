import type { Data } from './useData'
import { monthOf } from './dates'

function sum(items: { amount: number }[]) {
  return items.reduce((acumulado, item) => acumulado + item.amount, 0)
}

// All the numbers for one month, shared by the month and year views
export function monthSummary(data: Data, month: string) {
  // Whatever was left in the checking account from previous months
  const carry =
    sum(data.transfers.filter((t) => monthOf(t.date) < month)) -
    sum(data.bills.filter((b) => monthOf(b.date) < month))
  const monthTransfers = data.transfers.filter((t) => monthOf(t.date) === month)
  const fromSavings = sum(monthTransfers.filter((t) => t.source === 'savings'))
  const fromOthers = sum(monthTransfers.filter((t) => t.source === 'other'))
  const transferred = fromSavings + fromOthers
  const spent = sum(data.bills.filter((b) => monthOf(b.date) === month))
  const budget = carry + transferred
  const leftover = budget - spent

  // The salary goes into savings and my own transfers come out of it, money from others doesn't touch it.
  // Without a salary for the month there's no way to know what stayed there.
  const salary = data.salaries.find((s) => s.month === month)?.amount
  const savedInSavings = salary !== undefined ? salary - fromSavings : undefined
  // Only the new money counts, the carry was already saved the month before
  const savedInChecking = leftover - carry

  return { carry, fromSavings, fromOthers, transferred, budget, spent, leftover, salary, savedInSavings, savedInChecking }
}

export type MonthSummary = ReturnType<typeof monthSummary>
