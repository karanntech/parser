import { create } from 'zustand';
import { Candidate } from '@/types/candidate';

interface CandidateStore {
  candidates: Candidate[];
  setCandidates: (candidates: Candidate[]) => void;
  clearCandidates: () => void;
  updateApproval: (id: string) => void;

  shortlistedCandidates: Candidate[];
  setShortlistedCandidates: (candidates: Candidate[]) => void;

  step: number;
  setStep: (step: number) => void;
}

export const useCandidateStore = create<CandidateStore>((set) => ({
  candidates: [],
  setCandidates: (candidates) => set({ candidates }),
  clearCandidates: () => set({ candidates: [] }),
  updateApproval: (id) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, approved: !c.approved } : c
      ),
    })),

  shortlistedCandidates: [],
  setShortlistedCandidates: (candidates) => set({ shortlistedCandidates: candidates }),

  step: 1,
  setStep: (step) => set({ step }),
}));
