import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export type Candidate = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  status: string | null;
  source: string | null;
  notes: string | null;
  job_id: string | null;
  cv_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'placed'
  | 'rejected';

type FilterTab = CandidateStatus | 'all';

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    current_title: '',
    status: 'new' as CandidateStatus,
    source: '',
    notes: '',
    job_id: ''
  });

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'screening', label: 'Screening' },
    { id: 'interview', label: 'Interviewing' },
    { id: 'placed', label: 'Placed' },
    { id: 'rejected', label: 'Rejected' }
  ];

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('Error fetching candidates:', supabaseError);
        throw supabaseError;
      }

      setCandidates((data ?? []) as Candidate[]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load candidates';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    const channel = supabase
      .channel('candidates-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates'
        },
        () => {
          void loadCandidates();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadCandidates]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCandidate(null);
    setFormError(null);
    setFormValues({
      full_name: '',
      email: '',
      phone: '',
      location: '',
      current_title: '',
      status: 'new',
      source: '',
      notes: '',
      job_id: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (candidate: Candidate) => {
    setModalMode('edit');
    setEditingCandidate(candidate);
    setFormError(null);
    setFormValues({
      full_name: candidate.full_name ?? '',
      email: candidate.email ?? '',
      phone: candidate.phone ?? '',
      location: candidate.location ?? '',
      current_title: candidate.current_title ?? '',
      status: (candidate.status as CandidateStatus) ?? 'new',
      source: candidate.source ?? '',
      notes: candidate.notes ?? '',
      job_id: candidate.job_id ?? ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCandidate(null);
    setFormError(null);
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this candidate? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const { error: supabaseError } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        console.error('Error deleting candidate:', supabaseError);
        throw supabaseError;
      }

      setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
    } catch (err) {
      console.error('Delete candidate failed:', err);
      window.alert('Failed to delete candidate. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: CandidateStatus) => {
    const previous = candidates;
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, status: newStatus } : candidate
      )
    );

    try {
      const { error: supabaseError } = await supabase
        .from('candidates')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (supabaseError) {
        console.error('Error updating candidate status:', supabaseError);
        setCandidates(previous);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      setCandidates(previous);
    }
  };

  const handleViewCV = async (documentId: string) => {
    try {
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error('Error fetching document:', fetchError);
        window.alert('Failed to fetch CV document. Please try again.');
        return;
      }

      if (!document) {
        window.alert('CV document not found.');
        return;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        window.alert('Failed to generate CV link. Please try again.');
        return;
      }

      if (urlData?.signedUrl) {
        window.open(urlData.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('View CV failed:', err);
      window.alert('Failed to open CV. Please try again.');
    }
  };

  const handleFormChange = (
    field:
      | 'full_name'
      | 'email'
      | 'phone'
      | 'location'
      | 'current_title'
      | 'status'
      | 'source'
      | 'notes'
      | 'job_id',
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
      const payload = {
        full_name: formValues.full_name.trim() || null,
        email: email || null,
        phone: formValues.phone.trim() || null,
        location: formValues.location.trim() || null,
        current_title: formValues.current_title.trim() || null,
        status: formValues.status,
        source: formValues.source.trim() || null,
        notes: formValues.notes.trim() || null,
        job_id: formValues.job_id.trim() || null,
        cv_document_id: null as string | null,
        updated_at: now
      };

      if (modalMode === 'create') {
        const { data, error: supabaseError } = await supabase
          .from('candidates')
          .insert(payload)
          .select('*')
          .single();

        if (supabaseError) {
          console.error('Error creating candidate:', supabaseError);
          throw supabaseError;
        }

        setCandidates((prev) => [data as Candidate, ...prev]);
      } else if (modalMode === 'edit' && editingCandidate) {
        const { data, error: supabaseError } = await supabase
          .from('candidates')
          .update(payload)
          .eq('id', editingCandidate.id)
          .select('*')
          .single();

        if (supabaseError) {
          console.error('Error updating candidate:', supabaseError);
          throw supabaseError;
        }

        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate.id === editingCandidate.id
              ? (data as Candidate)
              : candidate
          )
        );
      }

      closeModal();
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save candidate');
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
            Candidates
          </h1>
          <p className="text-[#666666] mt-1 font-medium">Profiles, pipeline, and status tracking</p>
        </div>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          Add Candidate
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

      {candidates.length === 0 && !isLoading ? (
        <div className="neumorphic-card border border-[#e5e5e5] bg-white">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="neumorphic-icon-box p-6 mb-6">
              <Users className="w-12 h-12 text-[#A30E15]" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">No candidates found</h2>
            <p className="text-[#666666] mb-6 max-w-md">
              Add a new candidate to get started
            </p>
            <button
              className="neumorphic-button flex items-center gap-2 px-8 py-3 font-semibold"
              onClick={openCreateModal}
            >
              <Plus className="w-5 h-5" />
              Add candidate
            </button>
          </div>
        </div>
      ) : null}

      {candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="neumorphic-card border border-[#e5e5e5] bg-white p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      {candidate.full_name || 'Unnamed candidate'}
                    </h3>
                    <p className="text-sm text-[#666666]">
                      {candidate.current_title || 'Role not specified'}
                    </p>
                  </div>
                  <select
                    value={(candidate.status as CandidateStatus) ?? 'new'}
                    onChange={(event) =>
                      handleStatusChange(
                        candidate.id,
                        event.target.value as CandidateStatus
                      )
                    }
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f5f5] text-[#666666] border-none focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="placed">Placed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1 text-xs text-[#666666]">
                  <p>
                    <span className="font-semibold">Email:</span>{' '}
                    {candidate.email || 'Not provided'}
                  </p>
                  {candidate.phone && (
                    <p>
                      <span className="font-semibold">Phone:</span>{' '}
                      {candidate.phone}
                    </p>
                  )}
                  {candidate.location && (
                    <p>
                      <span className="font-semibold">Location:</span>{' '}
                      {candidate.location}
                    </p>
                  )}
                  {candidate.source && (
                    <p>
                      <span className="font-semibold">Source:</span>{' '}
                      {candidate.source}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">CV:</span>{' '}
                    {candidate.cv_document_id ? (
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewCV(candidate.cv_document_id!);
                        }}
                        className="text-[#A30E15] font-semibold hover:underline cursor-pointer"
                      >
                        View CV
                      </a>
                    ) : (
                      'No CV'
                    )}
                  </p>
                </div>
                {candidate.notes && (
                  <p className="mt-3 text-xs text-[#666666]">
                    {candidate.notes}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(candidate)}
                  className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(candidate.id)}
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
              {modalMode === 'create' ? 'Add Candidate' : 'Edit Candidate'}
            </h2>
            {formError && (
              <p className="text-sm text-red-600 mb-3">
                {formError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formValues.full_name}
                  onChange={(event) =>
                    handleFormChange('full_name', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  required
                />
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Current Title
                  </label>
                  <input
                    type="text"
                    value={formValues.current_title}
                    onChange={(event) =>
                      handleFormChange('current_title', event.target.value)
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
                        event.target.value as CandidateStatus
                      )
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15] bg-white"
                  >
                    <option value="new">New</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="placed">Placed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Source
                </label>
                <input
                  type="text"
                  value={formValues.source}
                  onChange={(event) =>
                    handleFormChange('source', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Job ID (optional)
                </label>
                <input
                  type="text"
                  value={formValues.job_id}
                  onChange={(event) =>
                    handleFormChange('job_id', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                />
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
                    ? 'Add Candidate'
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
