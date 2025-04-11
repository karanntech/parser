import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { Candidate } from '@/types/candidate';
import { processInBatches } from '@/utils/batchHelper';
import { storage, firestore } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    bodyParser: false,
  },
};

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const parseForm = async (req: NextApiRequest): Promise<FormidableFile[]> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const fileArray = Array.isArray(files.file)
        ? files.file
        : files.file
        ? [files.file as FormidableFile]
        : [];
      resolve(fileArray);
    });
  });
};

const extractTextFromPdf = async (file: FormidableFile): Promise<string> => {
  const pdfParse = (await import('pdf-parse')).default;
  const buffer = await fs.readFile(file.filepath);
  const parsed = await pdfParse(buffer);
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
      "email": "example@gmail.com",
      "phone": "+12 123456789",
      "location": "City, State/Country",
      "score": 80,
      "parsedText": "Summary of how the resume fits the job"
    }
  `;

  const result = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const raw = result.text ?? '';
  const cleaned = cleanGeminiJson(raw);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini parsing failed:', error, raw);
    throw new Error('Gemini did not return valid JSON');
  }
};

const uploadToFirebaseStorage = async (file: FormidableFile, candidateId: string): Promise<string> => {
  const buffer = await fs.readFile(file.filepath);
  const storageRef = ref(storage, `resumes/${candidateId}.pdf`);
  await uploadBytes(storageRef, buffer, { contentType: 'application/pdf' });
  return await getDownloadURL(storageRef);
};

const saveToFirestore = async (candidate: Candidate) => {
  const docRef = doc(firestore, 'candidates', candidate.id);
  await setDoc(docRef, candidate);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const files = await parseForm(req);
    const jobDescription = req.query.jd?.toString() || '';

    const candidates = await processInBatches<FormidableFile, Candidate>(
      files,
      10,
      async (batch) => {
        const batchResults: Candidate[] = [];

        for (const file of batch) {
          try {
            const text = await extractTextFromPdf(file);
            if (!text || text.length < 100) continue;

            const parsed = await parseWithGemini(text, jobDescription);
            const id = uuidv4();
            const resumeUrl = await uploadToFirebaseStorage(file, id);

            const candidate: Candidate = {
              id,
              ...parsed,
              resumeUrl,
              approved: false,
            };

            await saveToFirestore(candidate);
            batchResults.push(candidate);
          } catch (err) {
            console.error('Error processing resume:', err);
            continue;
          }
        }

        await delay(5000);
        return batchResults;
      }
    );

    const sorted = candidates.sort((a, b) => b.score - a.score);
    return res.status(200).json({
      success: true,
      total: sorted.length,
      candidates: sorted,
    });
  } catch (error) {
    console.error('[Parser Error]', error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}
