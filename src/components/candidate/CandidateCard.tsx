'use client';

import { useCandidateStore } from '@/store/useCandidateStore';
import { Candidate } from '@/types/candidate';
import { useState } from 'react';

type Props = {
  candidate: Candidate;
};

export default function CandidateCard({ candidate }: Props) {
  const { updateApproval } = useCandidateStore();
  const [approved, setApproved] = useState(candidate.approved);

  const handleToggle = () => {
    updateApproval(candidate.id);
    setApproved(prev => !prev);
  };

  return (
    <div className="bg-white border rounded-xl shadow-md overflow-hidden">
      <div className="w-full aspect-[4/3] border-b">
        <iframe
          src={candidate.resumeUrl}
          className="w-full h-full"
          title="Resume Viewer"
        />
      </div>

      <div className="p-4 space-y-2 text-sm">
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone:</strong> {candidate.phone}</p>
        <p><strong>Location:</strong> {candidate.location}</p>
        <p><strong>Score:</strong> {candidate.score.toFixed(2)}</p>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={approved}
            onChange={handleToggle}
            className="w-4 h-4"
          />
          <span>Approved</span>
        </label>
      </div>
    </div>
  );
}