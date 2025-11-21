import { useEffect, useState, type FormEvent } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import {
  fetchJobs,
  createJob,
  updateJob,
  duplicateJob,
  setJobStatus,
  deleteJob,
  type Job,
  type JobStatus
} from '@/lib/jobsApi';

type FilterTab = 'all' | JobStatus;
type JobFormMode = 'create' | 'edit';

export function RolesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<JobFormMode>('create');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    title: '',
    location: '',
    salary_range: '',
    job_type: 'Permanent' as Job['job_type'],
    description: '',
    requirements: '',
    benefits: '',
    status: 'draft' as JobStatus,
    expires_at: ''
  });

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live' },
    { id: 'draft', label: 'Draft' },
    { id: 'closed', label: 'Closed' }
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchJobs({
          status: activeFilter === 'all' ? 'all' : activeFilter,
          search: searchTerm
        });
        if (isMounted) {
          setJobs(data);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load jobs';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [activeFilter, searchTerm, refreshToken]);

  const reloadJobs = () => setRefreshToken((prev) => prev + 1);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingJob(null);
    setFormError(null);
    setFormValues({
      title: '',
      location: '',
      salary_range: '',
      job_type: 'Permanent',
      description: '',
      requirements: '',
      benefits: '',
      status: 'draft',
      expires_at: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setModalMode('edit');
    setEditingJob(job);
    setFormError(null);
    setFormValues({
      title: job.title ?? '',
      location: job.location ?? '',
      salary_range: job.salary_range ?? '',
      job_type: job.job_type,
      description: job.description ?? '',
      requirements: (job.requirements ?? []).join('\n'),
      benefits: (job.benefits ?? []).join('\n'),
      status: job.status,
      expires_at: job.expires_at ?? ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleDuplicate = async (job: Job) => {
    try {
      await duplicateJob(job);
      reloadJobs();
    } catch (err) {
      console.error('Duplicate job failed:', err);
      window.alert('Failed to duplicate job. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, status: JobStatus) => {
    try {
      await setJobStatus(id, status);
      reloadJobs();
    } catch (err) {
      console.error('Update job status failed:', err);
      window.alert('Failed to update job status. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this job? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteJob(id);
      reloadJobs();
    } catch (err) {
      console.error('Delete job failed:', err);
      window.alert('Failed to delete job. Please try again.');
    }
  };

  const handleEdit = (job: Job) => {
    openEditModal(job);
  };

  const handleFormChange = (
    field:
      | 'title'
      | 'location'
      | 'salary_range'
      | 'job_type'
      | 'description'
      | 'requirements'
      | 'benefits'
      | 'status'
      | 'expires_at',
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

    try {
      const payload = {
        title: formValues.title.trim(),
        location: formValues.location.trim(),
        salary_range: formValues.salary_range.trim() || undefined,
        job_type: formValues.job_type,
        description: formValues.description,
        requirements: formValues.requirements
          ? formValues.requirements
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        benefits: formValues.benefits
          ? formValues.benefits
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        status: formValues.status,
        expires_at: formValues.expires_at.trim() || null
      };

      if (modalMode === 'create') {
        await createJob(payload);
      } else if (editingJob) {
        await updateJob(editingJob.id, payload);
      }

      closeModal();
      reloadJobs();
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        setFormError(`Failed to save job: ${error.message}`);
      } else {
        setFormError('Failed to save job');
      }
    } finally {
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
            Roles
          </h1>
          <p className="text-[#666666] mt-1 font-medium">Live job listings and management</p>
        </div>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5" />
          New Role
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeFilter === tab.id
                ? 'neumorphic-button'
                : 'text-[#666666] hover:text-white hover:bg-[#A30E15]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by title or location"
          className="w-full max-w-md px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
        />
      </div>

      {isLoading && (
        <p className="text-sm text-[#666666]">Loading jobs...</p>
      )}

      {error && (
        <p className="text-sm text-red-600">Error loading jobs: {error}</p>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <div className="neumorphic-card border border-[#e5e5e5] bg-white">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="neumorphic-icon-box p-6 mb-6">
              <Briefcase className="w-12 h-12 text-[#A30E15]" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">No Roles Yet</h2>
            <p className="text-[#666666] mb-6 max-w-md">
              Create your first job listing
            </p>
            <button
              className="neumorphic-button flex items-center gap-2 px-8 py-3 font-semibold"
              onClick={openCreateModal}
            >
              <Plus className="w-5 h-5" />
              Create First Role
            </button>
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const createdDate = new Date(job.created_at).toLocaleDateString();

            return (
              <div
                key={job.id}
                className="neumorphic-card border border-[#e5e5e5] bg-white p-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-black">{job.title}</h3>
                  <p className="text-sm text-[#666666]">{job.location}</p>
                  <p className="text-xs text-[#666666]">
                    <span className="font-semibold capitalize">
                      {job.status}
                    </span>{' '}
                    · Posted {createdDate}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => handleEdit(job)}
                    className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(job)}
                    className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                  >
                    Duplicate
                  </button>
                  {job.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(job.id, 'live')}
                      className="px-3 py-1 rounded-full border border-[#A30E15] text-white bg-[#A30E15] font-semibold"
                    >
                      Make Live
                    </button>
                  )}
                  {job.status === 'live' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(job.id, 'draft')}
                      className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                    >
                      Move to Draft
                    </button>
                  )}
                  {(job.status === 'live' || job.status === 'draft') && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(job.id, 'closed')}
                      className="px-3 py-1 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                    >
                      Close Job
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(job.id)}
                    className="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center modal-overlay z-50">
          <div className="modal-content max-w-xl w-full mx-4 p-6 neumorphic-card border border-[#e5e5e5] bg-white">
            <h2 className="text-xl font-black text-black mb-4">
              {modalMode === 'create' ? 'New Role' : 'Edit Role'}
            </h2>
            {formError && (
              <p className="text-sm text-red-600 mb-3">
                {formError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Title
                </label>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(event) =>
                    handleFormChange('title', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  required
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
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={formValues.salary_range}
                  onChange={(event) =>
                    handleFormChange('salary_range', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  placeholder="e.g. £50,000 - £70,000"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Job Type
                  </label>
                  <select
                    value={formValues.job_type}
                    onChange={(event) =>
                      handleFormChange('job_type', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Status
                  </label>
                  <select
                    value={formValues.status}
                    onChange={(event) =>
                      handleFormChange('status', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  >
                    <option value="draft">Draft</option>
                    <option value="live">Live</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
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
                  className="w-full px-4 py-2 rounded-2xl border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Requirements (one per line)
                  </label>
                  <textarea
                    value={formValues.requirements}
                    onChange={(event) =>
                      handleFormChange('requirements', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-2xl border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                    rows={3}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Benefits (one per line)
                  </label>
                  <textarea
                    value={formValues.benefits}
                    onChange={(event) =>
                      handleFormChange('benefits', event.target.value)
                    }
                    className="w-full px-4 py-2 rounded-2xl border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                    rows={3}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Expires At
                </label>
                <input
                  type="date"
                  value={formValues.expires_at}
                  onChange={(event) =>
                    handleFormChange('expires_at', event.target.value)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-full border border-[#e5e5e5] text-[#333333] hover:bg-[#f5f5f5] font-semibold"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full border border-[#A30E15] text-white bg-[#A30E15] font-semibold"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : modalMode === 'create'
                    ? 'Create Role'
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
