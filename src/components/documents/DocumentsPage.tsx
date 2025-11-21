import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FileText, Upload } from 'lucide-react';
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  type Document,
  type DocumentCategory
} from '@/lib/documentsApi';
import { supabase } from '@/lib/supabaseClient';

type FilterTab = 'all' | 'contracts' | 'cvs' | 'reports';

export function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'contracts', label: 'Contracts' },
    { id: 'cvs', label: 'CVs' },
    { id: 'reports', label: 'Survey Reports' }
  ];

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load documents';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        () => {
          void loadDocuments();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadDocuments]);

  const openUploadModal = () => {
    setSelectedFile(null);
    setCategory('other');
    setCandidateId('');
    setJobId('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsUploading(false);
    setFormError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setFormError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setFormError(null);

    try {
      await uploadDocument(selectedFile, category, {
        candidate_id: candidateId.trim() || undefined,
        job_id: jobId.trim() || undefined
      });
      closeModal();
      await loadDocuments();
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setFormError(err.message);
      } else {
        setFormError('Failed to upload document');
      }
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this document? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteDocument(doc.id, doc.file_path);
      await loadDocuments();
    } catch (err) {
      console.error('Delete document failed:', err);
      window.alert('Failed to delete document. Please try again.');
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'contracts') return doc.category === 'contract';
    if (activeFilter === 'cvs') return doc.category === 'cv';
    if (activeFilter === 'reports') return doc.category === 'other';
    return true;
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
            Documents
          </h1>
          <p className="text-[#666666] mt-1 font-medium">Contracts, CVs, and survey reports</p>
        </div>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={openUploadModal}
        >
          <Upload className="w-5 h-5" />
          Upload Document
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

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-[#666666]">
          Loading documents...
        </p>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="neumorphic-card border border-[#e5e5e5] bg-white">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="neumorphic-icon-box p-6 mb-6">
              <FileText className="w-12 h-12 text-[#A30E15]" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">No Documents Yet</h2>
            <p className="text-[#666666] mb-6 max-w-md">
              Upload your first document
            </p>
            <button
              className="neumorphic-button flex items-center gap-2 px-8 py-3 font-semibold"
              onClick={openUploadModal}
            >
              <Upload className="w-5 h-5" />
              Upload First Document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="neumorphic-card border border-[#e5e5e5] bg-white p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-black mb-1">
                  {doc.name}
                </h3>
                <p className="text-sm text-[#666666] mb-1">
                  {doc.category.toUpperCase()}
                </p>
                <p className="text-xs text-[#666666]">
                  Uploaded{' '}
                  {new Date(doc.uploaded_at).toLocaleString()}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                {doc.public_url && (
                  <a
                    href={doc.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A30E15] font-semibold hover:underline"
                  >
                    Open
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="ml-auto px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
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
              Upload Document
            </h2>
            {formError && (
              <p className="text-sm text-red-600 mb-3">
                {formError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-black">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as DocumentCategory)
                  }
                  className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15] bg-white"
                >
                  <option value="cv">CV</option>
                  <option value="contract">Contract</option>
                  <option value="invoice">Invoice</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Candidate ID (optional)
                  </label>
                  <input
                    type="text"
                    value={candidateId}
                    onChange={(event) => setCandidateId(event.target.value)}
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-black">
                    Job ID (optional)
                  </label>
                  <input
                    type="text"
                    value={jobId}
                    onChange={(event) => setJobId(event.target.value)}
                    className="w-full px-4 py-2 rounded-full border border-[#e5e5e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#A30E15]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-full border border-[#e5e5e5] text-sm font-semibold text-[#333333] hover:bg-[#f5f5f5]"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neumorphic-button px-6 py-2 text-sm font-semibold"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
