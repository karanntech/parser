'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ParsedResume } from '@/types/candidate';

interface ResumeUploadProps {
  onParsed: (resumeTexts: string[]) => Promise<void>;
  jobDescription: string;
  setJobDescription: React.Dispatch<React.SetStateAction<string>>;
  recruiterSuggestion: string;
  setRecruiterSuggestion: React.Dispatch<React.SetStateAction<string>>;
}

export default function ResumeUpload({
  onParsed,
  jobDescription,
  setJobDescription,
  recruiterSuggestion,
  setRecruiterSuggestion,
}: ResumeUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedResumes, setParsedResumes] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 1000) {
      alert('You can upload up to 1000 resumes only.');
      return;
    }
    setFiles(prev => [...prev, ...selected]);
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !jobDescription.trim()) {
      alert('Please upload resumes and enter a job description.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file)); // backend expects 'file'
      formData.append('jobDescription', jobDescription);
      formData.append('recruiterSuggestion', recruiterSuggestion);

      const res = await fetch(`/api/parseresume?jd=${encodeURIComponent(jobDescription)}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        console.error('[Resume Parsing Error]', errorMsg);
        throw new Error('Failed to parse resumes');
      }

      const { candidates } = await res.json();
      console.log("Parsed candidates from backend:", candidates);

      const parsedTexts = (candidates as ParsedResume[]).map(r => r.parsedText || '');
      setParsedResumes(parsedTexts);
      await onParsed(parsedTexts);
    } catch (error) {
      console.error('[handleSubmit Error]', error);
      alert('Something went wrong while parsing resumes. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Parsed Resumes:", parsedResumes);
  }, [parsedResumes]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Upload Resumes</h2>

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
        className="text-sm"
      />
      <p className="text-sm text-gray-800">{files.length} file(s) selected</p>

      <div className="text-gray-900">
        <label className="block mb-1 font-medium">Job Description</label>
        <textarea
          rows={5}
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm"
        />
      </div>

      <div className="text-gray-900">
        <label className="block mb-1 font-medium">Recruiter Suggestions (Optional)</label>
        <textarea
          rows={3}
          value={recruiterSuggestion}
          onChange={e => setRecruiterSuggestion(e.target.value)}
          className="w-full p-3 border rounded-xl text-sm"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Processing...' : 'Submit & Parse Resumes'}
        </Button>
        {loading && <Spinner />}
      </div>
    </div>
  );
}