import { create } from 'zustand'

export type Category = {
  id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  is_hidden: boolean
  sort_order: number
  keywords: string[]
}

type CategoryStore = {
  categories: Category[]
  setCategories: (categories: Category[]) => void
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}))