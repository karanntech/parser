import { useState } from 'react';
import ResumeUpload from '@/components/upload/ResumeUpload';

export default function HomePage() {
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
    </div>
  );
}