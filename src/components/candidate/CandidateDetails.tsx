'use client';

import { Candidate } from '@/types/candidate';
import { Button } from '@/components/ui/Button';

type Props = {
  candidate: Candidate;
  onClose: () => void;
};

export default function CandidateDetails({ candidate, onClose }: Props) {
  const downloadResume = () => {
    const blob = new Blob([candidate.parsedText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${candidate.id}-resume.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-lg space-y-4 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-2">Candidate Details</h2>

        <div className="space-y-2 text-sm">
          <p><strong>ID:</strong> {candidate.id}</p>
          <p><strong>Score:</strong> {candidate.score.toFixed(2)}</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-1">Parsed Resume Text:</h3>
          <div className="max-h-72 overflow-y-auto p-3 border rounded-xl bg-gray-50 text-sm whitespace-pre-wrap">
            {candidate.parsedText || 'No text available'}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button onClick={downloadResume}>
            Download Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
