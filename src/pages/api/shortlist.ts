// src/pages/api/shortlist.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';
import { Candidate } from '@/types/candidate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobDescription, candidates, recruiterSuggestion } = req.body;

    if (!Array.isArray(candidates)) {
      return res.status(400).json({ error: 'Candidates must be an array' });
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `You are a smart recruitment assistant. Rate each candidate from 0 to 100 based on how well their resume matches the following job description:
${jobDescription}
${recruiterSuggestion ? `\nRecruiter Suggestion: ${recruiterSuggestion}` : ''}

Return a JSON array like:
[
  {
    "id": string,
    "score": number (0–100)
  }
]

Here are the candidates:
${candidates.map((c: Candidate) => `Candidate ID: ${c.id}\nResume:\n${c.parsedText}`).join('\n\n')}
`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsedScores = JSON.parse(text ?? '[]') as { id: string; score: number }[];

    const updatedCandidates = candidates.map((candidate: Candidate) => {
      const match = parsedScores.find((s) => s.id === candidate.id);
      return {
        ...candidate,
        score: match?.score ?? 0,
      };
    });

    return res.status(200).json({ candidates: updatedCandidates });
  } catch (err) {
    console.error('[SHORTLIST_ERROR]', err);
    return res.status(500).json({ error: 'Failed to process shortlist' });
  }
}
