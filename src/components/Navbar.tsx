import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CollegeLogo } from './CollegeLogo';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  LogOut,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Code2,
  BookOpen,
  Wifi,
  WifiOff,
  Database,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'students' | 'fees' | 'attendance' | 'notices' | 'faculty' | 'profile';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileDeviceView: boolean;
  onToggleDeviceView: () => void;
  onOpenApiConfig: () => void;
  onOpenAndroidSpecs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isMobileDeviceView,
  onToggleDeviceView,
  onOpenApiConfig,
  onOpenAndroidSpecs,
}) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const network = useNetworkStatus();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element brand wordmark with logo */}
        <div className="flex items-center gap-3 shrink-0">
          <CollegeLogo size="sm" />
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
              {t.collegeName}
            </span>
            <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap hidden sm:block">
              {t.collegeLocation} · {t.session}
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, unboxed, hover underline) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.dashboard}
          </button>

          {(user?.role === 'admin' || user?.role === 'accountant' || user?.role === 'faculty') && (
            <button
              onClick={() => onSelectTab('students')}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                currentTab === 'students'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              {t.students}
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'accountant') && (
            <button
              onClick={() => onSelectTab('fees')}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                currentTab === 'fees'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              {t.feeCollection}
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <button
              onClick={() => onSelectTab('attendance')}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                currentTab === 'attendance'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              {t.attendance}
            </button>
          )}

          <button
            onClick={() => onSelectTab('notices')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentTab === 'notices'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.notices}
          </button>

          <button
            onClick={() => onSelectTab('faculty')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentTab === 'faculty'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t.faculty}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Kotlin / Android Specs Button */}
          <button
            onClick={onOpenAndroidSpecs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
            title="Native Android Kotlin & Flutter Export"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Kotlin / Flutter</span>
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            title="Toggle Language (हिन्दी / English)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Mobile Shell Simulation Toggle */}
          <button
            onClick={onToggleDeviceView}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            title={isMobileDeviceView ? 'Switch to Full Desktop View' : 'Switch to Native Android Phone Preview'}
          >
            {isMobileDeviceView ? (
              <Monitor className="w-4 h-4 text-indigo-600" />
            ) : (
              <Smartphone className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Live Network & ERP Status Pill */}
          <button
            onClick={onOpenApiConfig}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
              network.isApiReachable && network.isBrowserOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title={`ndedu.in Status: ${network.isApiReachable ? 'Connected' : 'Offline'}. Click to configure API.`}
          >
            {network.isApiReachable && network.isBrowserOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-sans font-semibold">ndedu.in</span>
                {network.latencyMs && (
                  <span className="text-[10px] text-emerald-600">
                    {network.latencyMs}ms
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[11px] font-sans font-semibold">Offline</span>
                {network.pendingAttendanceCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                    {network.pendingAttendanceCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* API Config Trigger */}
          <button
            onClick={onOpenApiConfig}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="ERP API Gateway Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              onClick={() => onSelectTab('profile')}
              className="text-left hidden md:block cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[120px]">
                {language === 'hi' && user?.nameHi ? user.nameHi : user?.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                {user?.role}
              </div>
            </button>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
