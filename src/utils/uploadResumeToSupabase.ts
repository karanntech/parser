import { createClient } from '@supabase/supabase-js';
import { File as FormidableFile } from 'formidable';
import fs from 'fs/promises';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const uploadResumeToSupabase = async (file: FormidableFile) => {
  const buffer = await fs.readFile(file.filepath);
  const fileName = `${Date.now()}-${file.originalFilename}`;
  const filePath = `resumes/${fileName}`;

  const { error } = await supabase.storage
    .from('resumes')
    .upload(filePath, buffer, {
      contentType: file.mimetype || 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Error uploading file to Supabase Storage');
  }

  const publicUrlResult = supabase.storage.from('resumes').getPublicUrl(filePath);
  return publicUrlResult.data.publicUrl;
};
