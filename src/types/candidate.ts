export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl?: string;
  score: number;
  parsedText: string;
  approved: boolean;
}

export type ParsedResume = {
  index: number;
  success: boolean;
  parsed?: string;
  error?: string;
  parsedText: string;
};
