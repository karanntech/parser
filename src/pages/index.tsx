import { useState } from 'react';
import ResumeUpload from '@/components/upload/ResumeUpload';
import CandidateTable from '@/components/candidate/CandidateTable';
import { useCandidateStore } from '@/store/useCandidateStore';

export default function HomePage() {
  const { candidates } = useCandidateStore();
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterSuggestion, setRecruiterSuggestion] = useState('');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <ResumeUpload
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        recruiterSuggestion={recruiterSuggestion}
        setRecruiterSuggestion={setRecruiterSuggestion}
      />

      {candidates.length > 0 && <CandidateTable candidates={candidates} />}
    </div>
  );
}