import { supabase } from '@/lib/supabaseClient';

export type DocumentCategory = 'cv' | 'contract' | 'invoice' | 'other';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  file_path: string;
  public_url: string | null;
  candidate_id: string | null;
  job_id: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export async function fetchDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  return (data ?? []) as Document[];
}

export async function uploadDocument(
  file: File,
  category: DocumentCategory,
  meta?: { candidate_id?: string; job_id?: string }
): Promise<Document> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error getting current user for upload:', userError);
    throw userError;
  }

  if (!user) {
    const error = new Error('User must be authenticated to upload documents');
    console.error(error);
    throw error;
  }

  const path = `${user.id}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file);

  if (uploadError) {
    console.error('Error uploading document file:', uploadError);
    throw uploadError;
  }

  const { data: publicData } = supabase.storage
    .from('documents')
    .getPublicUrl(path);

  const publicUrl = publicData?.publicUrl ?? null;

  const insertPayload = {
    name: file.name,
    category,
    file_path: path,
    public_url: publicUrl,
    candidate_id: meta?.candidate_id ?? null,
    job_id: meta?.job_id ?? null,
    uploaded_by: user.id
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating document record:', error);
    throw error;
  }

  return data as Document;
}

export async function deleteDocument(
  id: string,
  file_path: string
): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id);

  if (error) {
    console.error('Error deleting document record:', error);
    throw error;
  }

  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([file_path]);

  if (storageError) {
    console.error('Error deleting document file:', storageError);
    throw storageError;
  }
}

