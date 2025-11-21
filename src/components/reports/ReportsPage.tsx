import { BarChart3, TrendingUp, Clock, DollarSign, Briefcase } from 'lucide-react';

export function ReportsPage() {
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
            Reports
          </h1>
          <p className="text-[#666666] mt-1 font-medium">KPI dashboards and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="neumorphic-card border border-[#e5e5e5] bg-white transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-[#A30E15]"
          onClick={() =>
            window.alert('Reporting dashboards will be added in a later version.')
          }
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="neumorphic-icon-box p-3">
                <Briefcase className="w-6 h-6 text-[#A30E15]" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[32px] font-black text-black">0</p>
              <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Roles Filled</p>
            </div>
          </div>
        </div>

        <div
          className="neumorphic-card border border-[#e5e5e5] bg-white transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-[#A30E15]"
          onClick={() =>
            window.alert('Reporting dashboards will be added in a later version.')
          }
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="neumorphic-icon-box p-3">
                <Clock className="w-6 h-6 text-[#A30E15]" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[32px] font-black text-black">0d</p>
              <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Avg Time to Placement</p>
            </div>
          </div>
        </div>

        <div
          className="neumorphic-card border border-[#e5e5e5] bg-white transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-[#A30E15]"
          onClick={() =>
            window.alert('Reporting dashboards will be added in a later version.')
          }
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="neumorphic-icon-box p-3">
                <TrendingUp className="w-6 h-6 text-[#A30E15]" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[32px] font-black text-black">0d</p>
              <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Survey Turnaround</p>
            </div>
          </div>
        </div>

        <div
          className="neumorphic-card border border-[#e5e5e5] bg-white transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-[#A30E15]"
          onClick={() =>
            window.alert('Reporting dashboards will be added in a later version.')
          }
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="neumorphic-icon-box p-3">
                <DollarSign className="w-6 h-6 text-[#A30E15]" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[32px] font-black text-black">£0</p>
              <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Revenue MTD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="neumorphic-card border border-[#e5e5e5] bg-white">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="neumorphic-icon-box p-3">
              <BarChart3 className="w-6 h-6 text-[#A30E15]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-black mb-1">Performance Analytics</h3>
              <p className="text-base font-semibold text-black mb-2">No data available yet</p>
              <p className="text-sm text-[#666666]">Start tracking your recruitment and survey metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
