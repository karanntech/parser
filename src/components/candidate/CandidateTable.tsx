'use client';

import { Candidate } from '@/types/candidate';
import { useState } from 'react';

type Props = {
  candidates: Candidate[];
};

export default function CandidateTable({ candidates }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleDownload = (candidate: Candidate) => {
    const blob = new Blob([candidate.parsedText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${candidate.name || candidate.id}-resume.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Parsed Candidates</h2>

      <table className="w-full border rounded-xl overflow-hidden text-sm">
        <thead className="bg-gray-100 font-medium">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Location</th>
            <th className="p-3">Score</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.id} className="border-t hover:bg-gray-50 transition">
              <td className="p-3">{candidate.name}</td>
              <td className="p-3">{candidate.email}</td>
              <td className="p-3">{candidate.phone}</td>
              <td className="p-3">{candidate.location}</td>
              <td className="p-3">{candidate.score.toFixed(2)}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => handleToggleExpand(candidate.id)}
                  className="text-blue-600 hover:underline"
                >
                  {expandedId === candidate.id ? 'Hide Text' : 'View Text'}
                </button>
                <button
                  onClick={() => handleDownload(candidate)}
                  className="text-green-600 hover:underline"
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Expanded resume text area */}
      {expandedId && (
        <div className="bg-gray-100 p-4 rounded-xl whitespace-pre-wrap max-h-96 overflow-y-auto border">
          <strong>Resume Text:</strong>
          <p className="mt-2 text-sm">
            {
              candidates.find(c => c.id === expandedId)?.parsedText ||
              'No parsed text found.'
            }
          </p>
        </div>
      )}
    </div>
  );
}