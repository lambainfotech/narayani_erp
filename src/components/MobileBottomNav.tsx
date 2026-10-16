import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NavTab } from './Navbar';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  Bell,
  UserCircle,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const isAccountant = user?.role === 'accountant';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg no-print">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
            currentTab === 'dashboard'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
            {t.dashboard}
          </span>
        </button>

        {/* Tab 2: Students or Profile depending on role */}
        {!isStudent ? (
          <button
            onClick={() => onSelectTab('students')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
              currentTab === 'students'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {t.students}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
              currentTab === 'profile'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {t.profile}
            </span>
          </button>
        )}

        {/* Tab 3: Fees (for Admin/Accountant) or Attendance (for Faculty/Student) */}
        {!isFaculty ? (
          <button
            onClick={() => onSelectTab('fees')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
              currentTab === 'fees'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {t.feeCollection}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('attendance')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
              currentTab === 'attendance'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {t.attendance}
            </span>
          </button>
        )}

        {/* Tab 4: Attendance for Admin/Accountant OR Fees for Faculty */}
        {!isFaculty ? (
          <button
            onClick={() => onSelectTab('attendance')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
              currentTab === 'attendance'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {t.attendance}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('students')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
              currentTab === 'students'
                ? 'text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {t.students}
            </span>
          </button>
        )}

        {/* Tab 5: Notices */}
        <button
          onClick={() => onSelectTab('notices')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-colors ${
            currentTab === 'notices'
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
            {t.notices}
          </span>
        </button>
      </div>
    </nav>
  );
};
