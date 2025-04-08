import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs/promises';
import { Candidate } from '@/types/candidate';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const genAI = new GoogleGenAI({
  apiKey: 'AIzaSyBfgNxkp_AJ4jqvbpSA9ZvgGlf-ZhiME0U',
});


const parseForm = async (req: NextApiRequest): Promise<FormidableFile[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadDir = path.join(process.cwd(), 'tmp');
      await fs.mkdir(uploadDir, { recursive: true }); // Ensure /tmp exists

      const form = new IncomingForm({
        multiples: true,
        uploadDir,
        keepExtensions: true,
      });

      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);

        const fileArray: FormidableFile[] = Array.isArray(files.file)
          ? files.file
          : files.file
          ? [files.file as FormidableFile]
          : [];

        console.log('Received files:', fileArray.map(f => f.originalFilename));
        resolve(fileArray);
      });
    } catch (mkdirErr) {
      reject(mkdirErr);
    }
  });
};

const extractTextFromPdf = async (file: FormidableFile): Promise<string> => {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await fs.readFile(file.filepath);
  const parsed = await pdfParse(data);
  console.log('Extracted PDF text length:', parsed.text.length);
  return parsed.text;
};

const cleanGeminiJson = (raw: string): string => {
  return raw.trim().replace(/^```json\s*|\s*```$/g, '');
};

const parseWithGemini = async (
  text: string,
  jobDescription: string
): Promise<Omit<Candidate, 'id' | 'approved' | 'resumeUrl'>> => {
  const prompt = `
    Job Description: ${jobDescription}

    Resume Text:
    ${text}

    Based on the job description, return a JSON with:
    {
      "name": "Candidate Name",
      "contact": "Email or Phone",
      "score": 80,
      "parsedText": "Summary of how the resume fits the job"
    }
  `;

  const result = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const rawText = result.text ?? '';
  const cleaned = cleanGeminiJson(rawText);

  console.log("Gemini raw response:", rawText);
  console.log("Cleaned response:", cleaned);
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Gemini did not return valid JSON");
  }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const files = await parseForm(req);
    const jobDescription = req.query.jd?.toString() || '';
    console.log('Job Description received:', jobDescription);

    const candidates: Candidate[] = [];

    for (const [index, file] of files.entries()) {
      const text = await extractTextFromPdf(file);
      if (!text || text.length < 100) {
        console.warn(`Resume [${index}] has too little text`);
        continue;
      }

      try {
        const parsed = await parseWithGemini(text, jobDescription);

        candidates.push({
          id: `candidate-${index}`,
          name: parsed.name,
          contact: parsed.contact,
          score: parsed.score,
          parsedText: parsed.parsedText,
          resumeUrl: '',
          approved: false,
        });
      } catch (err) {
        console.error(`Gemini parsing failed for resume [${index}]`, err);
        continue;
      }
    }

    return res.status(200).json({ success: true, candidates });
  } catch (error) {
    console.error('[Parser Error]', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
