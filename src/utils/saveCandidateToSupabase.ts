import { createClient } from '@supabase/supabase-js';
import { Candidate } from '@/types/candidate';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const saveCandidateToSupabase = async (candidate: Candidate) => {
  const { error } = await supabase
    .from('candidates')
    .insert([candidate]);

  if (error) {
    console.error('Error saving candidate:', error.message);
    throw new Error('Failed to save candidate');
  }
};
