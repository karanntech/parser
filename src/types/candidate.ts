export interface Candidate {
  id: string;
  name: string;
  contact?: string;
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
