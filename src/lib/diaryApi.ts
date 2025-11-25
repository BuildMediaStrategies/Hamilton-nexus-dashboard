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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diary entries:', error);
    return [];
  }

  return (data ?? []).map((entry: any) => ({
    ...entry,
    entry_type: (entry.entry_type || 'note') as EntryType,
    priority: (entry.priority || 'medium') as Priority,
    checklist: Array.isArray(entry.checklist) ? entry.checklist : []
  }));
}

export async function createDiaryEntry(payload: CreateDiaryEntryPayload): Promise<DiaryEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('diary_entries')
    .insert({
      user_id: user.id,
      content: payload.content,
      entry_type: payload.entry_type || 'note',
      priority: payload.priority || 'medium',
      checklist: Array.isArray(payload.checklist) ? payload.checklist : []
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating diary entry:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    entry_type: (data.entry_type || 'note') as EntryType,
    priority: (data.priority || 'medium') as Priority,
    checklist: Array.isArray(data.checklist) ? data.checklist : []
  };
}

export async function updateDiaryEntryChecklist(
  entryId: string,
  checklist: ChecklistItem[]
): Promise<DiaryEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const safeChecklist = Array.isArray(checklist) ? checklist : [];

  const { data, error } = await supabase
    .from('diary_entries')
    .update({ checklist: safeChecklist })
    .eq('id', entryId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating diary entry checklist:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    entry_type: (data.entry_type || 'note') as EntryType,
    priority: (data.priority || 'medium') as Priority,
    checklist: Array.isArray(data.checklist) ? data.checklist : []
  };
}
