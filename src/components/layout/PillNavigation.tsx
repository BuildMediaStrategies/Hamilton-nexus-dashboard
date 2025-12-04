import { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, Building2, BookText, FileText, Receipt, ChartBar as BarChart3, Settings, Bell, LogOut } from 'lucide-react';

interface PillNavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
  userEmail: string;
  onLogout: () => void;
}

const navItems = [
  { id: 'roles', label: 'Roles', icon: Briefcase },
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'diary', label: 'Diary', icon: BookText },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function PillNavigation({ activePage, onNavigate, userEmail, onLogout }: PillNavigationProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = userEmail
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full px-2 sm:px-4">
      <div className="neumorphic-pill flex items-center justify-between px-3 sm:px-6 h-[70px] max-w-[95vw] mx-auto overflow-visible">
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center leading-none hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span
              className="text-[20px] sm:text-[24px] uppercase tracking-tighter"
              style={{
                fontFamily: '"Lombok", sans-serif',
                color: '#A30E15',
                WebkitTextStroke: '1px #A30E15',
                lineHeight: '1'
              }}
            >
              HAMILTON
            </span>
            <span
              className="text-[20px] sm:text-[24px] uppercase tracking-tighter"
              style={{
                fontFamily: '"Lombok", sans-serif',
                color: '#A30E15',
                WebkitTextStroke: '1px #A30E15',
                lineHeight: '1',
                marginTop: '2px'
              }}
            >
              NEXUS
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 overflow-x-auto flex-1 min-w-0 justify-center mx-2 sm:mx-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 text-[14px] sm:text-[15px] font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'neumorphic-button'
                    : 'text-[#666666] hover:text-white hover:bg-[#A30E15] rounded-full'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            className="neumorphic-button relative p-2 text-[#000000] hover:text-white transition-colors hidden sm:flex"
            onClick={() =>
              window.alert('Notifications will be added in a later version.')
            }
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#A30E15] rounded-full"></span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              role="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1 sm:gap-2 hover:bg-[#A30E15] hover:text-white px-1 sm:px-2 py-1 rounded-full transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[#e5e5e5] rounded-full bg-[#f5f5f5] flex items-center justify-center">
                <span className="text-black text-xs font-bold">{initials}</span>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 neumorphic-card border border-[#e5e5e5] bg-white p-2 rounded-2xl shadow-sm z-50">
                <div className="text-xs text-[#666666] px-3 py-2 font-semibold truncate">
                  {userEmail}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f5] text-sm font-semibold text-black flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
