'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useCandidateStore } from '@/store/useCandidateStore';
import { Candidate } from '@/types/candidate';

type Props = {
  jobDescription: string;
  setJobDescription: (text: string) => void;
  recruiterSuggestion: string;
  setRecruiterSuggestion: (text: string) => void;
};

export default function ResumeUpload({
  jobDescription,
  setJobDescription,
  recruiterSuggestion,
  setRecruiterSuggestion,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCandidates } = useCandidateStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    const fileList = Array.from(files);
    fileList.forEach(file => formData.append('file', file));
    setSelectedFiles(fileList); // for UI display

    setLoading(true);
    setError('');

    try {
      const query = new URLSearchParams({
        jd: jobDescription,
        rs: recruiterSuggestion,
      });

      const res = await fetch(`/api/parseresume?${query.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to parse resumes');
      }

      const { candidates }: { candidates: Candidate[] } = await res.json();
      setCandidates(candidates);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Unexpected error occurred.');
      } else {
        setError('Unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-black">Upload Resumes</h2>

      {/* Job Description Section */}
      <div className="grid gap-4">
        <textarea
          rows={5}
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm text-gray-800"
        />

        <textarea
          rows={3}
          placeholder="Recruiter notes or suggestions (optional)"
          value={recruiterSuggestion}
          onChange={e => setRecruiterSuggestion(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm text-gray-800"
        />
      </div>

      {/* File Upload Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-600">Resume Files</h3>

        <input
          type="file"
          accept=".pdf"
          multiple
          ref={inputRef}
          onChange={handleFiles}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="bg-black text-white py-2 px-4 rounded-xl hover:bg-gray-900"
        >
          {loading ? 'Parsing Resumes...' : 'Select PDF Resumes'}
        </button>

        {/* Show selected files */}
        {selectedFiles.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {selectedFiles.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        )}

        {/* Error display */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}