import { create } from 'zustand'

export type Budget = {
  id: string
  category_id: string
  amount: number
  month: number
  year: number
}

type BudgetStore = {
  budgets: Budget[]
  setBudgets: (budgets: Budget[]) => void
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
}))