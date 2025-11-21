import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Receipt, Plus } from 'lucide-react';
import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  type Invoice,
  type InvoiceStatus
} from '@/lib/invoicesApi';
import { fetchClients, type Client } from '@/lib/clientsApi';

type FilterTab = 'all' | InvoiceStatus;

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>(
    'all'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    client_id: '',
    invoice_number: '',
    amount: '',
    currency: 'GBP',
    status: 'draft' as InvoiceStatus,
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    description: ''
  });

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' }
  ];

  const loadClients = useCallback(async () => {
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (err) {
      console.error('Error loading clients for invoices', err);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load invoices';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
    void loadInvoices();
  }, [loadClients, loadInvoices]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingInvoice(null);
    setFormError(null);
    setFormValues({
      client_id: '',
      invoice_number: '',
      amount: '',
      currency: 'GBP',
      status: 'draft',
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (invoice: Invoice) => {
    setModalMode('edit');
    setEditingInvoice(invoice);
    setFormError(null);
    setFormValues({
      client_id: invoice.client_id ?? '',
      invoice_number: invoice.invoice_number,
      amount: String(invoice.amount),
      currency: invoice.currency,
      status: invoice.status,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date ?? '',
      description: invoice.description ?? ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormError(null);
    setIsSaving(false);
  };

  const handleFormChange = (
    field:
      | 'client_id'
      | 'invoice_number'
      | 'amount'
      | 'currency'
      | 'status'
      | 'issue_date'
      | 'due_date'
      | 'description',
    value: string
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this invoice? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteInvoice(id);
      await loadInvoices();
    } catch (err) {
      console.error('Delete invoice failed:', err);
      window.alert('Failed to delete invoice. Please try again.');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    const amountNumber = Number(formValues.amount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setFormError('Please enter a valid amount.');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        client_id: formValues.client_id.trim() || null,
        invoice_number: formValues.invoice_number.trim(),
        amount: amountNumber,
        currency: formValues.currency.trim() || 'GBP',
        status: formValues.status,
        issue_date: formValues.issue_date,
        due_date: formValues.due_date.trim() || null,
        description: formValues.description.trim() || null,
        pdf_url: null as string | null
      };

      if (modalMode === 'create') {
        await createInvoice(payload);
      } else if (modalMode === 'edit' && editingInvoice) {
        await updateInvoice(editingInvoice.id, payload);
      }

      closeModal();
      await loadInvoices();
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save invoice');
      }
      setIsSaving(false);
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'No client';
    const client = clients.find((c) => c.id === clientId);
    return client?.company_name ?? 'Unknown client';
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (statusFilter === 'all') return true;
    return invoice.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black"
            style={{
              background: 'linear-gradient(135deg, #A30E15 0%, #780A0F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Invoices
          </h1>
          <p className="text-[#666666] mt-1 font-medium">Billing for recruitment and survey work</p>
        </div>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          New Invoice
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              statusFilter === tab.id
                ? 'neumorphic-button'
                : 'text-[#666666] hover:text-white hover:bg-[#A30E15]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-[#666666]">
          Loading invoices...
        </p>
      )}

      {filteredInvoices.length === 0 ? (
        <div className="neumorphic-card border border-[#e5e5e5] bg-white">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="neumorphic-icon-box p-6 mb-6">
              <Receipt className="w-12 h-12 text-[#A30E15]" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">No Invoices Yet</h2>
            <p className="text-[#666666] mb-6 max-w-md">
              Create your first invoice
            </p>
            <button
              className="neumorphic-button flex items-center gap-2 px-8 py-3 font-semibold"
              onClick={openCreateModal}
            >
              <Plus className="w-5 h-5" />
              Create First Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="neumorphic-card border border-[#e5e5e5] bg-white p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      {getClientName(invoice.client_id)}
                    </h3>
                    <p className="text-sm text-[#666666]">
                      Invoice #{invoice.invoice_number}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f5f5] text-[#666666]">
                    {invoice.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#666666]">
                  <p>
                    <span className="font-semibold">Amount:</span>{' '}
                    {invoice.currency} {invoice.amount.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-semibold">Issue Date:</span>{' '}
                    {invoice.issue_date}
                  </p>
                  {invoice.due_date && (
                    <p>
                      <span className="font-semibold">Due Date:</span>{' '}
                      {invoice.due_date}
                    </p>
                  )}
                </div>
                {invoice.description && (
                  <p className="mt-3 text-xs text-[#666666]">
                    {invoice.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(invoice)}
                  className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(invoice)}
                  className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(invoice.id)}
                  className="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center modal-overlay z-50">
          <div className="modal-content max-w-xl w-full mx-4 p-6 neumorphic-card border border-[#e5e5e5] bg-white">
            <h2 className="text-xl font-black text-black mb-4">
              {modalMode === 'create' ? 'New Invoice' : 'Edit Invoice'}
            </h2>
            {formError && (
              <p className="text-sm text-red-600 mb-3">
                {formError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formValues.client_id}
                  onChange={(event) =>
                    handleFormChange('client_id', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formValues.invoice_number}
                  onChange={(event) =>
                    handleFormChange('invoice_number', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValues.amount}
                    onChange={(event) =>
                      handleFormChange('amount', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formValues.currency}
                    onChange={(event) =>
                      handleFormChange('currency', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Status
                  </label>
                  <select
                    value={formValues.status}
                    onChange={(event) =>
                      handleFormChange(
                        'status',
                        event.target.value as InvoiceStatus
                      )
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15] bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formValues.issue_date}
                    onChange={(event) =>
                      handleFormChange('issue_date', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formValues.due_date}
                  onChange={(event) =>
                    handleFormChange('due_date', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Description
                </label>
                <textarea
                  value={formValues.description}
                  onChange={(event) =>
                    handleFormChange('description', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-2xl border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15] min-h-[80px] resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-full border border-[#e5e5e5] text-sm font-semibold text-[#333333] hover:bg-[#f5f5f5]"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neumorphic-button px-6 py-2 text-sm font-semibold"
                  disabled={isSaving}
                >
                  {isSaving
                    ? modalMode === 'create'
                      ? 'Creating...'
                      : 'Saving...'
                    : modalMode === 'create'
                    ? 'Create Invoice'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewInvoice && (
        <div className="fixed inset-0 flex items-center justify-center modal-overlay z-50">
          <div className="modal-content max-w-xl w-full mx-4 p-6 neumorphic-card border border-[#e5e5e5] bg-white">
            <div className="mb-4">
              <h2
                className="text-2xl font-black mb-2"
                style={{
                  background:
                    'linear-gradient(135deg, #A30E15 0%, #780A0F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                HAMILTON NEXUS
              </h2>
              <p className="text-sm text-[#666666]">
                Invoice Preview
              </p>
            </div>
            <div className="space-y-2 text-sm text-[#333333] mb-4">
              <p>
                <span className="font-semibold">Invoice #:</span>{' '}
                {previewInvoice.invoice_number}
              </p>
              <p>
                <span className="font-semibold">Client:</span>{' '}
                {getClientName(previewInvoice.client_id)}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                {previewInvoice.status}
              </p>
              <p>
                <span className="font-semibold">Issue Date:</span>{' '}
                {previewInvoice.issue_date}
              </p>
              {previewInvoice.due_date && (
                <p>
                  <span className="font-semibold">Due Date:</span>{' '}
                  {previewInvoice.due_date}
                </p>
              )}
              <p>
                <span className="font-semibold">Amount:</span>{' '}
                {previewInvoice.currency} {previewInvoice.amount.toFixed(2)}
              </p>
            </div>
            {previewInvoice.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-1">
                  Description
                </h3>
                <p className="text-sm text-[#666666]">
                  {previewInvoice.description}
                </p>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 rounded-full border border-[#e5e5e5] text-sm font-semibold text-[#333333] hover:bg-[#f5f5f5]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
