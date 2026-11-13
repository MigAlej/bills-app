// Dates are plain strings: 'YYYY-MM-DD' for days and 'YYYY-MM' for months

function toISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function parseMonth(month: string) {
  const [y, m] = month.split('-').map(Number)
  return { y, m }
}

export function today() {
  return toISO(new Date())
}

export function monthOf(date: string) {
  return date.slice(0, 7)
}

export function addMonths(month: string, n: number) {
  const { y, m } = parseMonth(month)
  return toISO(new Date(y, m - 1 + n, 1)).slice(0, 7)
}

export function monthLabel(month: string) {
  const { y, m } = parseMonth(month)
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export function shortMonthLabel(month: string) {
  const { y, m } = parseMonth(month)
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' })
}

export function dayLabel(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function daysInMonth(month: string) {
  const { y, m } = parseMonth(month)
  return new Date(y, m, 0).getDate()
}

// Monday = 0, Sunday = 6
export function firstWeekday(month: string) {
  const { y, m } = parseMonth(month)
  return (new Date(y, m - 1, 1).getDay() + 6) % 7
}

// Today if we're looking at the current month, otherwise the 1st
export function defaultDate(month: string) {
  return monthOf(today()) === month ? today() : `${month}-01`
}

const euroFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' })

export function euros(n: number) {
  return euroFormat.format(n)
}
