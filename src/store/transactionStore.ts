import { create } from 'zustand'

export type Transaction = {
  id: string
  amount: number
  my_share?: number
  merchant: string
  bank?: string
  mode?: string
  txn_type?: string
  transaction_date: string
  category_id?: string
  status: 'PENDING' | 'CONFIRMED' | 'SKIPPED'
  note?: string
  is_splittable: boolean
}

type TransactionStore = {
  transactions: Transaction[]
  pendingCount: number
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, data: Partial<Transaction>) => void
  setPendingCount: (count: number) => void
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  pendingCount: 0,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateTransaction: (id, data) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),
  setPendingCount: (count) => set({ pendingCount: count }),
}))