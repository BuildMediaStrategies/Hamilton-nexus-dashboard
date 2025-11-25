import { useState, useEffect } from 'react';
import { BookText, Plus, X } from 'lucide-react';
import {
  fetchDiaryEntries,
  createDiaryEntry,
  updateDiaryEntryChecklist,
  DiaryEntry,
  EntryType,
  Priority,
  ChecklistItem
} from '@/lib/diaryApi';
import { supabase } from '@/lib/supabaseClient';

export function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('note');
  const [priority, setPriority] = useState<Priority>('medium');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadEntries();
  }, []);

  const checkAuthAndLoadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      await loadEntries();
    } catch (err) {
      console.error('Failed to check authentication:', err);
      setError('Failed to verify authentication. Please try refreshing the page.');
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      setError(null);
      const data = await fetchDiaryEntries();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load diary entries:', err);
      setError('Failed to load diary entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;

    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem,
      completed: false
    };

    setChecklistItems([...checklistItems, item]);
    setNewChecklistItem('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const result = await createDiaryEntry({
        content: newEntry,
        entry_type: entryType,
        priority,
        checklist: checklistItems
      });

      if (!result) {
        setError('Failed to create diary entry. Please check your authentication and try again.');
        return;
      }

      setNewEntry('');
      setEntryType('note');
      setPriority('medium');
      setChecklistItems([]);
      await loadEntries();
    } catch (err) {
      console.error('Failed to create diary entry:', err);
      setError('Failed to create diary entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleChecklistItem = async (entry: DiaryEntry, itemId: string) => {
    const checklist = Array.isArray(entry.checklist) ? entry.checklist : [];
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    try {
      setError(null);
      const result = await updateDiaryEntryChecklist(entry.id, updatedChecklist);

      if (!result) {
        setError('Failed to update checklist. Please try again.');
        return;
      }

      await loadEntries();
    } catch (err) {
      console.error('Failed to update checklist:', err);
      setError('Failed to update checklist. Please try again.');
    }
  };

  if (isLoading) {
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
              Diary
            </h1>
            <p className="text-[#666666] mt-1 font-medium">Activity log and notes</p>
          </div>
        </div>
        <div className="neumorphic-card border border-[#e5e5e5] bg-white p-8 text-center">
          <p className="text-[#666666] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
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
              Diary
            </h1>
            <p className="text-[#666666] mt-1 font-medium">Activity log and notes</p>
          </div>
        </div>
        <div className="neumorphic-card border border-[#e5e5e5] bg-white p-8 text-center">
          <p className="text-black font-semibold mb-2">Please log in to use the diary.</p>
          <p className="text-[#666666] font-medium text-sm">You need to be authenticated to view and create diary entries.</p>
        </div>
      </div>
    );
  }

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
            Diary
          </h1>
          <p className="text-[#666666] mt-1 font-medium">Activity log and notes</p>
        </div>
      </div>

      {error && (
        <div className="neumorphic-card border border-[#A30E15] bg-white p-4">
          <p className="text-[#A30E15] font-semibold text-sm">{error}</p>
        </div>
      )}

      <div className="neumorphic-card border border-[#e5e5e5] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-black mb-2">
                Entry Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType('note')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    entryType === 'note'
                      ? 'neumorphic-button'
                      : 'text-[#666666] hover:text-white hover:bg-[#A30E15]'
                  }`}
                >
                  Diary Note
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('task')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    entryType === 'task'
                      ? 'neumorphic-button'
                      : 'text-[#666666] hover:text-white hover:bg-[#A30E15]'
                  }`}
                >
                  Task
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-black mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    priority === 'low'
                      ? 'neumorphic-button'
                      : 'text-[#666666] hover:text-white hover:bg-[#A30E15]'
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    priority === 'medium'
                      ? 'neumorphic-button'
                      : 'text-[#666666] hover:text-white hover:bg-[#A30E15]'
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    priority === 'high'
                      ? 'neumorphic-button'
                      : 'text-[#666666] hover:text-white hover:bg-[#A30E15]'
                  }`}
                >
                  High
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="entry" className="block text-sm font-semibold text-black mb-2">
              Content
            </label>
            <textarea
              id="entry"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Write your note here..."
              rows={4}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A30E15] focus:border-transparent resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Checklist
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Add checklist item..."
                className="flex-1 px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A30E15] focus:border-transparent font-medium text-sm"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                disabled={!newChecklistItem.trim()}
                className="px-4 py-2 rounded-full text-sm font-semibold text-[#666666] hover:text-white hover:bg-[#A30E15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
            {checklistItems.length > 0 && (
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f5] rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      disabled
                      className="w-4 h-4 rounded border-[#e5e5e5]"
                    />
                    <span className="flex-1 text-sm font-medium text-black">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-[#666666] hover:text-[#A30E15] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!newEntry.trim() || isSubmitting}
            className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? 'Adding...' : 'Add Entry'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="neumorphic-card border border-[#e5e5e5] bg-white">
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="neumorphic-icon-box p-6 mb-6">
                <BookText className="w-12 h-12 text-[#A30E15]" />
              </div>
              <h2 className="text-2xl font-black text-black mb-2">No Entries Yet</h2>
              <p className="text-[#666666] mb-6 max-w-md">
                Start adding notes to your diary
              </p>
            </div>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="neumorphic-card border border-[#e5e5e5] bg-white p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f5f5] text-black">
                    {entry.entry_type === 'note' ? 'Note' : 'Task'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      entry.priority === 'high'
                        ? 'bg-[#A30E15] text-white'
                        : entry.priority === 'medium'
                        ? 'bg-[#666666] text-white'
                        : 'bg-[#e5e5e5] text-[#666666]'
                    }`}
                  >
                    {entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)}
                  </span>
                </div>
                <div className="text-xs text-[#666666] font-semibold">
                  {new Date(entry.created_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <p className="text-black font-medium whitespace-pre-wrap mb-3">{entry.content}</p>
              {Array.isArray(entry.checklist) && entry.checklist.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-semibold text-black mb-2">Checklist</div>
                  {entry.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f5] rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed || false}
                        onChange={() => handleToggleChecklistItem(entry, item.id)}
                        className="w-4 h-4 rounded border-[#e5e5e5] cursor-pointer"
                      />
                      <span
                        className={`flex-1 text-sm font-medium ${
                          item.completed
                            ? 'text-[#666666] line-through'
                            : 'text-black'
                        }`}
                      >
                        {item.text || ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
