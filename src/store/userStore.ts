import { create } from 'zustand'

type User = {
  id: string
  firebase_uid: string
  email: string
  name?: string
  fcm_token?: string
}

type UserStore = {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))