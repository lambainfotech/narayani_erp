import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UseNetworkStatusReturn } from '../hooks/useNetworkStatus';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Server,
  CloudOff,
} from 'lucide-react';

interface NetworkStatusBannerProps {
  status: UseNetworkStatusReturn;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ status }) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissedByUser, setIsDismissedByUser] = useState(false);

  const {
    isBrowserOnline,
    isApiReachable,
    latencyMs,
    lastChecked,
    error,
    pendingAttendanceCount,
    isChecking,
    isSyncing,
    showRestoredNotice,
    dismissRestoredNotice,
    checkConnection,
    syncPendingAttendance,
  } = status;

  const isDisconnected = !isBrowserOnline || !isApiReachable;

  // Connection Restored Toast (Automatic Green Notification)
  if (showRestoredNotice) {
    return (
      <aside
        aria-label="Network status notification"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg animate-in fade-in slide-in-from-top-4 duration-300"
      >
        <div className="bg-emerald-950/90 backdrop-blur-md text-emerald-100 border border-emerald-500/40 shadow-2xl rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs font-medium">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{language === 'hi' ? 'ndedu.in ERP से कनेक्शन बहाल' : 'Connected to ndedu.in ERP'}</span>
                {latencyMs && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-800/60 text-emerald-300">
                    {latencyMs}ms
                  </span>
                )}
              </div>
              <div className="text-[11px] text-emerald-200/80 mt-0.5">
                {language === 'hi'
                  ? 'स्थानीय रूप से सुरक्षित रिकॉर्ड्स स्वतः सिंक किए जा रहे हैं।'
                  : 'Pending local records are being synchronized automatically.'}
              </div>
            </div>
          </div>

          <button
            onClick={dismissRestoredNotice}
            className="p-1 rounded-lg hover:bg-emerald-800/60 text-emerald-300 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // If connected and no pending records, show nothing (or just a mini header indicator elsewhere)
  if (!isDisconnected) {
    if (pendingAttendanceCount > 0) {
      // Subtle floating banner indicating pending records to sync even when connection is good
      return (
        <aside
          aria-label="Pending attendance synchronization notification"
          className="fixed bottom-20 sm:bottom-6 right-4 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-slate-100 border border-indigo-500/40 shadow-xl rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold block text-slate-200">
                  {language === 'hi'
                    ? `${pendingAttendanceCount} उपस्थिति रिकॉर्ड्स सिंक हेतु शेष`
                    : `${pendingAttendanceCount} Attendance Record(s) Cached`}
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'क्लिक करके सिंक करें' : 'Ready to push to ndedu.in'}
                </span>
              </div>
            </div>

            <button
              onClick={() => syncPendingAttendance()}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (language === 'hi' ? 'सिंक...' : 'Syncing...') : (language === 'hi' ? 'सिंक करें' : 'Sync')}</span>
            </button>
          </div>
        </aside>
      );
    }
    return null;
  }

  // User dismissed the expanded banner, show subtle mini floating pill
  if (isDismissedByUser) {
    return (
      <aside
        aria-label="Network status banner"
        className="fixed bottom-20 sm:bottom-6 right-4 z-40 animate-in fade-in duration-200"
      >
        <button
          onClick={() => setIsDismissedByUser(false)}
          className="bg-amber-950/90 text-amber-200 border border-amber-600/50 shadow-lg px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-amber-900 transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>ndedu.in Offline</span>
          {pendingAttendanceCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
              {pendingAttendanceCount}
            </span>
          )}
        </button>
      </aside>
    );
  }

  // Disconnected Banner (Subtle Top / Overlay Alert)
  return (
    <aside
      aria-label="API connection status"
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-950/95 via-amber-900/95 to-amber-950/95 backdrop-blur-md text-amber-100 border-b border-amber-600/40 shadow-lg px-3 sm:px-6 py-2.5"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Left Side: Status & Explanation */}
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 mt-0.5 sm:mt-0">
            <CloudOff className="w-3.5 h-3.5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                {language === 'hi' ? 'ndedu.in ERP से संपर्क विच्छेद' : 'Connection to ndedu.in ERP Lost'}
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono">
                {!isBrowserOnline ? 'Device Offline' : 'ERP FastRoute Gateway Down'}
              </span>

              {pendingAttendanceCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-semibold flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-300" />
                  {language === 'hi'
                    ? `${pendingAttendanceCount} उपस्थिति रिकॉर्ड्स स्थानीय रूप से सुरक्षित`
                    : `${pendingAttendanceCount} attendance records queued offline`}
                </span>
              )}
            </div>

            <p className="text-[11px] text-amber-200/80 mt-0.5">
              {language === 'hi'
                ? 'ऑफलाइन मोड सक्रिय है। दर्ज की गई उपस्थिति डिवाइस पर सुरक्षित रहेगी और नेटवर्क बहाल होते ही स्वतः सिंक हो जाएगी।'
                : 'Offline caching active. Attendance entered now will be saved locally and auto-submitted when connection returns.'}
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => checkConnection(false)}
            disabled={isChecking}
            className="px-2.5 py-1.5 rounded-lg bg-amber-600/40 hover:bg-amber-600/60 active:scale-95 border border-amber-500/40 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Test connection to ndedu.in API now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? (language === 'hi' ? 'जांच जारी...' : 'Checking...') : (language === 'hi' ? 'पुनः जांचें' : 'Retry Now')}</span>
          </button>

          {pendingAttendanceCount > 0 && (
            <button
              onClick={() => syncPendingAttendance()}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Force sync local attendance queue"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSyncing ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (language === 'hi' ? 'सिंक प्रयास' : 'Sync Queue')}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-800/40 transition-colors cursor-pointer"
            title="Toggle Connection Diagnostics"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsDismissedByUser(true)}
            className="p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-amber-800/40 transition-colors cursor-pointer"
            title="Minimize Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Technical Diagnostics Drawer */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-800/50 text-[11px] grid grid-cols-1 sm:grid-cols-4 gap-2 text-amber-200">
          <div>
            <span className="text-amber-400 block font-mono text-[10px]">ERP HOST:</span>
            <span className="font-mono text-white">https://ndedu.in/erp/api</span>
          </div>
          <div>
            <span className="text-amber-400 block font-mono text-[10px]">BROWSER STATUS:</span>
            <span className="font-semibold text-white">
              {isBrowserOnline ? 'Online (navigator.onLine)' : 'Offline (No internet)'}
            </span>
          </div>
          <div>
            <span className="text-amber-400 block font-mono text-[10px]">LAST ERROR:</span>
            <span className="font-mono text-amber-300 truncate block" title={error || 'None'}>
              {error || 'None'}
            </span>
          </div>
          <div>
            <span className="text-amber-400 block font-mono text-[10px]">LAST CHECK:</span>
            <span className="font-mono text-white">
              {lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
