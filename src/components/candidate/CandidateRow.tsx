'use client';

import { Candidate } from "@/types/candidate";

type Props = {
  candidate: Candidate;
  isApproved: boolean;
  onToggleApprove: (id: string) => void;
  onViewDetails: () => void;
};

export default function CandidateRow({
  candidate,
  isApproved,
  onToggleApprove,
  onViewDetails,
}: Props) {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="p-3 font-mono text-sm">{candidate.id}</td>
      <td className="p-3 text-sm">{candidate.score.toFixed(2)}</td>
      <td className="p-3">
        <input
          type="checkbox"
          checked={isApproved}
          onChange={() => onToggleApprove(candidate.id)}
          className="w-4 h-4"
        />
      </td>
      <td className="p-3 text-blue-600 cursor-pointer hover:underline text-sm" onClick={onViewDetails}>
        View Details
      </td>
    </tr>
  );
}
