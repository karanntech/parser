
import { useState } from 'react';
import ResumeUpload from '@/components/upload/ResumeUpload';
import CandidateList from '@/components/candidate/CandidateList';
import { useCandidateStore } from '@/store/useCandidateStore';
import { Candidate } from '@/types/candidate';

export default function HomePage() {
  const { candidates, setCandidates } = useCandidateStore();
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterSuggestion, setRecruiterSuggestion] = useState('');

  const handleParsed = async (resumeTexts: string[]) => {
    try {
      const parseRes = await fetch('/api/parseresume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeTexts }),
      });

      const parsedCandidates: Candidate[] = await parseRes.json();

      const shortlistRes = await fetch('/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates: parsedCandidates,
          jobDescription,
          recruiterSuggestion,
        }),
      });

      const finalCandidates: Candidate[] = await shortlistRes.json();
      setCandidates(finalCandidates);
    } catch (error) {
      console.error('[handleParsed Error]', error);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <ResumeUpload
        onParsed={handleParsed}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        recruiterSuggestion={recruiterSuggestion}
        setRecruiterSuggestion={setRecruiterSuggestion}
      />

      {candidates.length > 0 && <CandidateList candidates={candidates} />}
    </div>
  );
}
