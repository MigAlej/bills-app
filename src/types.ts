export interface Bill {
  id: string
  amount: number
  note: string
  date: string
  category: string | null
}

export interface Transfer {
  id: string
  amount: number
  note: string
  date: string
  source: 'savings' | 'other'
}

export interface Salary {
  month: string // 'YYYY-MM'
  amount: number
}

export interface Category {
  id: string
  name: string
}
