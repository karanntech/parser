// src/utils/saveCandidate.ts
import { firestore } from '@/lib/firebase';
import { Candidate } from '@/types/candidate';
import { collection, addDoc } from 'firebase/firestore';

export const saveCandidateToFirestore = async (candidateData: Candidate) => {
  const candidatesRef = collection(firestore, 'candidates');
  await addDoc(candidatesRef, candidateData);
};
