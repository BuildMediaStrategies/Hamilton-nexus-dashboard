import { supabase } from '@/lib/supabaseClient';

export type EntryType = 'note' | 'task';
export type Priority = 'low' | 'medium' | 'high';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  entry_type: EntryType;
  priority: Priority;
  checklist: ChecklistItem[];
  created_at: string;
}

export interface CreateDiaryEntryPayload {
  content: string;
  entry_type: EntryType;
  priority: Priority;
  checklist: ChecklistItem[];
}

export async function fetchDiaryEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diary entries:', error);
    throw error;
  }

  return (data ?? []) as DiaryEntry[];
}

export async function createDiaryEntry(payload: CreateDiaryEntryPayload): Promise<DiaryEntry> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('diary_entries')
    .insert({
      user_id: user.id,
      content: payload.content,
      entry_type: payload.entry_type,
      priority: payload.priority,
      checklist: payload.checklist
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating diary entry:', error);
    throw error;
  }

  return data as DiaryEntry;
}

export async function updateDiaryEntryChecklist(
  entryId: string,
  checklist: ChecklistItem[]
): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .update({ checklist })
    .eq('id', entryId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating diary entry checklist:', error);
    throw error;
  }

  return data as DiaryEntry;
}
