import { useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';

type FilterTab = 'all' | 'active' | 'completed' | 'pending';

export function SurveysPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const surveys: any[] = [];

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' }
  ];

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
            Surveys
          </h1>
          <p className="text-[#666666] mt-1 font-medium">Survey projects, status, and reporting</p>
        </div>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={() =>
            window.alert('This feature will be added in a later version.')
          }
        >
          <Plus className="w-5 h-5" />
          New Survey
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

      {surveys.length === 0 ? (
        <div className="neumorphic-card border border-[#e5e5e5] bg-white">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="neumorphic-icon-box p-6 mb-6">
              <ClipboardList className="w-12 h-12 text-[#A30E15]" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">No Surveys Yet</h2>
            <p className="text-[#666666] mb-6 max-w-md">
              Create your first survey project
            </p>
            <button
              className="neumorphic-button flex items-center gap-2 px-8 py-3 font-semibold"
              onClick={() =>
                window.alert(
                  'This feature will be added in a later version.'
                )
              }
            >
              <Plus className="w-5 h-5" />
              Create First Survey
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        </div>
      )}
    </div>
  );
}
