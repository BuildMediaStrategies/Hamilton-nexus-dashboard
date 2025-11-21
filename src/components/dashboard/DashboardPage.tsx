import { useEffect, useState, type ElementType } from 'react';
import { Briefcase, ClipboardList, Users, Building2, Plus, TrendingUp, Receipt } from 'lucide-react';
import { fetchJobs, type Job } from '@/lib/jobsApi';

interface StatCardProps {
  title: string;
  value: number;
  icon: ElementType;
  onClick?: () => void;
}

function StatCard({ title, value, icon: Icon, onClick }: StatCardProps) {
  return (
    <div
      className="neumorphic-card border border-[#e5e5e5] bg-white transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-[#A30E15]"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="neumorphic-icon-box p-3">
            <Icon className="w-6 h-6 text-[#A30E15]" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[32px] font-black text-black">{value}</p>
          <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">{title}</p>
        </div>
      </div>
    </div>
  );
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      try {
        const data = await fetchJobs({ status: 'live' });
        if (isMounted) {
          setJobs(data);
        }
      } catch (error) {
        console.error('Error loading dashboard jobs', error);
      }
    }

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

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
            Dashboard
          </h1>
          <p className="text-[#666666] mt-1 font-medium">Overview of recruitment and survey operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Roles"
          value={jobs.length}
          icon={Briefcase}
          onClick={() => onNavigate('roles')}
        />
        <StatCard
          title="Candidates in Pipeline"
          value={0}
          icon={Users}
          onClick={() => onNavigate('candidates')}
        />
        <StatCard
          title="Active Surveys"
          value={0}
          icon={ClipboardList}
          onClick={() => onNavigate('surveys')}
        />
        <StatCard
          title="Client Companies"
          value={0}
          icon={Building2}
          onClick={() => onNavigate('clients')}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={() => onNavigate('roles')}
        >
          <Plus className="w-5 h-5" />
          New Role
        </button>
        <button
          className="neumorphic-button flex items-center gap-2 px-6 py-3 font-semibold"
          onClick={() => onNavigate('surveys')}
        >
          <Plus className="w-5 h-5" />
          New Survey
        </button>
      </div>

      <div
        className="neumorphic-card border border-[#e5e5e5] bg-white overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="neumorphic-icon-box p-3">
              <TrendingUp className="w-6 h-6 text-[#A30E15]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-black mb-1">Business Insights</h3>
              <p className="text-base font-semibold text-black mb-2">Performance tracking active</p>
              <p className="text-sm text-[#666666]">Ready to track recruitment and survey metrics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="neumorphic-card border border-[#e5e5e5] bg-white">
        <div className="p-6">
          <h3 className="text-lg font-bold text-black mb-4">Recent Activity</h3>
          <p className="text-gray-500 text-sm">
            No recent activity yet. New jobs, candidates and surveys will appear here once the system is in use.
          </p>
        </div>
      </div>
    </div>
  );
}
