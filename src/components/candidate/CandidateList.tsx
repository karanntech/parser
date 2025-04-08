'use client';

import { useState } from 'react';
import CandidateRow from './CandidateRow';
import CandidateDetails from './CandidateDetails';
import { Candidate } from '@/types/candidate';

type Props = {
  candidates: Candidate[];
};

const ITEMS_PER_PAGE = 10;

export default function CandidateList({ candidates }: Props) {
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [showOnlyApproved, setShowOnlyApproved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const toggleApprove = (id: string) => {
    setApprovedIds(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const filteredCandidates = showOnlyApproved
    ? candidates.filter(c => approvedIds.includes(c.id))
    : candidates;

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginated = filteredCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Candidate List</h2>
        <label className="text-sm space-x-2">
          <input
            type="checkbox"
            checked={showOnlyApproved}
            onChange={e => setShowOnlyApproved(e.target.checked)}
          />
          <span>Show Only Approved</span>
        </label>
      </div>

      <table className="w-full text-left border rounded-xl overflow-hidden">
        <thead className="bg-gray-100 text-sm font-semibold">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Score</th>
            <th className="p-3">Approve</th>
            <th className="p-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map(candidate => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              isApproved={approvedIds.includes(candidate.id)}
              onToggleApprove={toggleApprove}
              onViewDetails={() => setSelectedCandidate(candidate)}
            />
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
