import { supabase } from '@/lib/supabaseClient';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  client_id: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  description: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }

  return (data ?? []) as Invoice[];
}

export async function createInvoice(
  payload: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }

  return data as Invoice;
}

export async function updateInvoice(
  id: string,
  payload: Partial<Omit<Invoice, 'id'>>
): Promise<Invoice> {
  const updateData = {
    ...payload,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }

  return data as Invoice;
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase.from('invoices').delete().eq('id', id);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

