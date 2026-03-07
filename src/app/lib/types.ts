export type TransactionType = 'INCOME' | 'EXPENSE' | 'INVESTMENT'

export interface Transaction {
  id: string
  user_id: string
  date: string
  type: TransactionType
  main_category: string
  sub_category?: string
  amount: number
  notes?: string
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: TransactionType
  subcategories: string[]
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  pay_day: number
  created_at: string
}