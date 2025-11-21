import { supabase } from '@/lib/supabaseClient';

export interface Client {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return (data ?? []) as Client[];
}

export async function createClient(
  payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  return data as Client;
}

export async function updateClient(
  id: string,
  payload: Partial<Omit<Client, 'id'>>
): Promise<Client> {
  const updateData = {
    ...payload,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }

  return data as Client;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

