import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Building2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export type Client = {
  id: string;
  name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  sector: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ClientStatus = 'active' | 'prospect' | 'dormant';
type FilterTab = ClientStatus | 'all';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterTab>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    company_name: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    sector: '',
    status: 'prospect' as ClientStatus,
    notes: ''
  });

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'prospect', label: 'Prospects' },
    { id: 'dormant', label: 'Dormant' }
  ];

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('Error fetching clients:', supabaseError);
        throw supabaseError;
      }

      setClients((data ?? []) as Client[]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load clients';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingClient(null);
    setFormError(null);
    setFormValues({
      company_name: '',
      name: '',
      email: '',
      phone: '',
      location: '',
      sector: '',
      status: 'prospect',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setModalMode('edit');
    setEditingClient(client);
    setFormError(null);
    setFormValues({
      company_name: client.company_name ?? '',
      name: client.name ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      location: client.location ?? '',
      sector: client.sector ?? '',
      status: (client.status as ClientStatus) ?? 'prospect',
      notes: client.notes ?? ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormError(null);
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this client? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const { error: supabaseError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        console.error('Error deleting client:', supabaseError);
        throw supabaseError;
      }

      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (err) {
      console.error('Delete client failed:', err);
      window.alert('Failed to delete client. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ClientStatus) => {
    const previous = clients;
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, status: newStatus } : client
      )
    );

    try {
      const { error: supabaseError } = await supabase
        .from('clients')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (supabaseError) {
        console.error('Error updating client status:', supabaseError);
        setClients(previous);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      setClients(previous);
    }
  };

  const handleFormChange = (
    field:
      | 'company_name'
      | 'name'
      | 'email'
      | 'phone'
      | 'location'
      | 'sector'
      | 'status'
      | 'notes',
    value: string
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    const email = formValues.email.trim();
    if (email && !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      setIsSaving(false);
      return;
    }

    try {
      const now = new Date().toISOString();
      const basePayload = {
        company_name: formValues.company_name.trim() || null,
        name: formValues.name.trim() || null,
        email: email || null,
        phone: formValues.phone.trim() || null,
        location: formValues.location.trim() || null,
        sector: formValues.sector.trim() || null,
        status: formValues.status,
        notes: formValues.notes.trim() || null,
        updated_at: now
      };

      if (modalMode === 'create') {
        const payload = {
          ...basePayload,
          created_at: now
        };

        const { data, error: supabaseError } = await supabase
          .from('clients')
          .insert(payload)
          .select('*')
          .single();

        if (supabaseError) {
          console.error('Error creating client:', supabaseError);
          throw supabaseError;
        }

        setClients((prev) => [data as Client, ...prev]);
      } else if (modalMode === 'edit' && editingClient) {
        const { data, error: supabaseError } = await supabase
          .from('clients')
          .update(basePayload)
          .eq('id', editingClient.id)
          .select('*')
          .single();

        if (supabaseError) {
          console.error('Error updating client:', supabaseError);
          throw supabaseError;
        }

        setClients((prev) =>
          prev.map((client) =>
            client.id === editingClient.id ? (data as Client) : client
          )
        );
      }

      closeModal();
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save client');
      }
      setIsSaving(false);
    }
  };

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
            Clients
          </h1>
          <p className="text-[#666666] mt-1 font-medium">
            Company contacts and placements
          </p>
        </div>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          Add Client
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
          Loading clients...
        </p>
      )}

      {clients.length === 0 && !isLoading ? (
        <div className="neumorphic-card border border-[#e5e5e5] bg-white">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="neumorphic-icon-box p-6 mb-6">
              <Building2 className="w-12 h-12 text-[#A30E15]" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">
              No clients yet
            </h2>
            <p className="text-[#666666] mb-6 max-w-md">
              Add your first client to track active work and opportunities.
            </p>
            <button
              className="neumorphic-button flex items-center gap-2 px-8 py-3 font-semibold"
              onClick={openCreateModal}
            >
              <Plus className="w-5 h-5" />
              Add client
            </button>
          </div>
        </div>
      ) : null}

      {clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="neumorphic-card border border-[#e5e5e5] bg-white p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-1">
                      {client.company_name || 'Unnamed company'}
                    </h3>
                    {client.name && (
                      <p className="text-sm text-[#666666] mb-1">
                        Contact: {client.name}
                      </p>
                    )}
                    {client.sector && (
                      <p className="text-xs text-[#666666]">
                        Sector: {client.sector}
                      </p>
                    )}
                  </div>
                  <select
                    value={(client.status as ClientStatus) ?? 'prospect'}
                    onChange={(event) =>
                      handleStatusChange(
                        client.id,
                        event.target.value as ClientStatus
                      )
                    }
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f5f5] text-[#666666] border-none focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="dormant">Dormant</option>
                  </select>
                </div>
                <div className="space-y-1 text-xs text-[#666666]">
                  {client.email && (
                    <p>
                      <span className="font-semibold">Email:</span>{' '}
                      {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p>
                      <span className="font-semibold">Phone:</span>{' '}
                      {client.phone}
                    </p>
                  )}
                  {client.location && (
                    <p>
                      <span className="font-semibold">Location:</span>{' '}
                      {client.location}
                    </p>
                  )}
                </div>
                {client.notes && (
                  <p className="mt-3 text-xs text-[#666666]">
                    {client.notes}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(client)}
                  className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(client.id)}
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
              {modalMode === 'create' ? 'Add Client' : 'Edit Client'}
            </h2>
            {formError && (
              <p className="text-sm text-red-600 mb-3">
                {formError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formValues.company_name}
                  onChange={(event) =>
                    handleFormChange('company_name', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(event) =>
                    handleFormChange('name', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={(event) =>
                      handleFormChange('email', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formValues.phone}
                    onChange={(event) =>
                      handleFormChange('phone', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Location
                </label>
                <input
                  type="text"
                  value={formValues.location}
                  onChange={(event) =>
                    handleFormChange('location', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Sector
                  </label>
                  <input
                    type="text"
                    value={formValues.sector}
                    onChange={(event) =>
                      handleFormChange('sector', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Status
                  </label>
                  <select
                    value={formValues.status}
                    onChange={(event) =>
                      handleFormChange(
                        'status',
                        event.target.value as ClientStatus
                      )
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15] bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="dormant">Dormant</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Notes
                </label>
                <textarea
                  value={formValues.notes}
                  onChange={(event) =>
                    handleFormChange('notes', event.target.value)
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
                      ? 'Adding...'
                      : 'Saving...'
                    : modalMode === 'create'
                    ? 'Add Client'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

