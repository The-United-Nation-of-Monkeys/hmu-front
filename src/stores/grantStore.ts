import { create } from 'zustand'
import { Grant } from '@/lib/grants'

interface GrantState {
  currentGrant: Grant | null
  grants: Grant[]
  setCurrentGrant: (grant: Grant | null) => void
  setGrants: (grants: Grant[]) => void
  fetchGrants: () => Promise<void>
}

export const grantStore = create<GrantState>((set) => ({
  currentGrant: null,
  grants: [],
  setCurrentGrant: (grant) => set({ currentGrant: grant }),
  setGrants: (grants) => set({ grants }),
  fetchGrants: async () => {
    // This will be called from components using React Query
    // Store is mainly for current selection
  },
}))

