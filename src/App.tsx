import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar, NavTab } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
import { StudentModule } from './components/StudentModule';
import { FeeModule } from './components/FeeModule';
import { AttendanceModule } from './components/AttendanceModule';
import { NoticeModule } from './components/NoticeModule';
import { FacultyModule } from './components/FacultyModule';
import { ProfileModule } from './components/ProfileModule';
import { ApiConfigModal } from './components/ApiConfigModal';
import { NativeAndroidDocs } from './components/NativeAndroidDocs';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { Student } from './types/erp';
import { Smartphone, Wifi, Battery, Signal } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const network = useNetworkStatus();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState<boolean>(false);
  const [isAndroidSpecsOpen, setIsAndroidSpecsOpen] = useState<boolean>(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState<boolean>(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<Student | null>(null);

  if (!isAuthenticated) {
    return (
      <>
        <NetworkStatusBanner status={network} />
        <LoginScreen
          onOpenApiConfig={() => setIsApiConfigOpen(true)}
          onOpenAndroidSpecs={() => setIsAndroidSpecsOpen(true)}
        />
        <ApiConfigModal
          isOpen={isApiConfigOpen}
          onClose={() => setIsApiConfigOpen(false)}
          onOpenAndroidSpecs={() => setIsAndroidSpecsOpen(true)}
        />
        <NativeAndroidDocs
          isOpen={isAndroidSpecsOpen}
          onClose={() => setIsAndroidSpecsOpen(false)}
        />
      </>
    );
  }

  const handleCollectFeeForStudent = (student: Student) => {
    setSelectedStudentForFee(student);
    setCurrentTab('fees');
  };

  const renderModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            onSelectTab={setCurrentTab}
            onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
          />
        );
      case 'students':
        return (
          <StudentModule
            onCollectFeeForStudent={handleCollectFeeForStudent}
            isAdmissionModalOpen={isAdmissionModalOpen}
            setIsAdmissionModalOpen={setIsAdmissionModalOpen}
          />
        );
      case 'fees':
        return <FeeModule initialStudent={selectedStudentForFee} />;
      case 'attendance':
        return <AttendanceModule />;
      case 'notices':
        return <NoticeModule />;
      case 'faculty':
        return <FacultyModule />;
      case 'profile':
        return (
          <ProfileModule
            onOpenApiConfig={() => setIsApiConfigOpen(true)}
            onOpenAndroidSpecs={() => setIsAndroidSpecsOpen(true)}
          />
        );
      default:
        return (
          <Dashboard
            onSelectTab={setCurrentTab}
            onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      {/* Subtle Offline / Connection Toast & Banner */}
      <NetworkStatusBanner status={network} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileDeviceView={isMobileDeviceView}
        onToggleDeviceView={() => setIsMobileDeviceView(!isMobileDeviceView)}
        onOpenApiConfig={() => setIsApiConfigOpen(true)}
        onOpenAndroidSpecs={() => setIsAndroidSpecsOpen(true)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 w-full flex justify-center py-4 sm:py-6 px-3 sm:px-6">
        {isMobileDeviceView ? (
          /* Native Android Device Shell Frame Simulation */
          <div className="w-full max-w-[420px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col h-[820px] overflow-hidden">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-700 ml-3" />
            </div>

            {/* Android Status Bar */}
            <div className="pt-2 px-5 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-300 select-none shrink-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Android Screen Body */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-4 pb-20 rounded-b-[32px]">
              {renderModule()}
            </div>

            {/* Android Navigation Bar */}
            <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
          </div>
        ) : (
          /* Full Responsive Desktop & Tablet Layout */
          <main className="w-full max-w-7xl pb-20 lg:pb-8">
            {renderModule()}
          </main>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Active on standard small viewports) */}
      {!isMobileDeviceView && (
        <div className="lg:hidden">
          <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
        </div>
      )}

      {/* Modals & Drawers */}
      <ApiConfigModal
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
        onOpenAndroidSpecs={() => setIsAndroidSpecsOpen(true)}
      />

      <NativeAndroidDocs
        isOpen={isAndroidSpecsOpen}
        onClose={() => setIsAndroidSpecsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
