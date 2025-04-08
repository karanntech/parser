import { create } from 'zustand';
import { Candidate } from '@/types/candidate';

interface CandidateStore {
  candidates: Candidate[];
  setCandidates: (candidates: Candidate[]) => void;
  clearCandidates: () => void;
  updateApproval: (id: string) => void;
}

export const useCandidateStore = create<CandidateStore>((set) => ({
  candidates: [],
  setCandidates: (candidates) => set({ candidates }),
  clearCandidates: () => set({ candidates: [] }),
  updateApproval: (id: string) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, approved: !c.approved } : c
      ),
    })),
}));
