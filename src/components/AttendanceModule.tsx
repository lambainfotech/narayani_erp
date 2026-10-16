import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Student, AttendanceBatch, AttendanceStudentEntry, PendingAttendanceBatch } from '../types/erp';
import { erpApi } from '../services/api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  queueAttendanceBatch,
  getPendingAttendanceBatches,
  removePendingAttendanceBatch,
  syncPendingAttendanceBatches,
} from '../services/offlineAttendance';
import {
  Calendar,
  Check,
  X,
  Users,
  CheckCircle2,
  Save,
  BookOpen,
  Database,
  CloudOff,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const network = useNetworkStatus();

  const [course, setCourse] = useState('B.A.');
  const [year, setYear] = useState('2nd Year');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('Hindi Literature');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<AttendanceStudentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [cachedNotice, setCachedNotice] = useState<string | null>(null);

  // Offline queue state
  const [pendingQueue, setPendingQueue] = useState<PendingAttendanceBatch[]>([]);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Subject choices by course
  const subjectOptions: Record<string, string[]> = {
    'B.A.': ['Hindi Literature', 'Geography', 'Political Science', 'History', 'English Literature', 'Sanskrit'],
    'B.Sc.': ['Botany', 'Zoology', 'Chemistry', 'Physics', 'Mathematics'],
    'B.Com.': ['Accountancy & Business Statistics (ABST)', 'Business Administration (BADM)', 'Economic Administration & Financial Management (EAFM)'],
    'M.A. Hindi': ['Adhunik Hindi Kavya', 'Bhasha Vigyan', 'Hindi Sahitya Ka Itihas'],
    'M.A. Geography': ['Physical Geography', 'Geography of India', 'Urban Geography'],
  };

  const refreshQueue = useCallback(() => {
    setPendingQueue(getPendingAttendanceBatches());
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [network.pendingAttendanceCount, refreshQueue]);

  const loadClassStudents = async () => {
    setLoading(true);
    setSaveSuccess(null);
    setCachedNotice(null);
    try {
      const all = await erpApi.getStudents('', course, year);
      const classList = all.length > 0 ? all : (await erpApi.getStudents()).slice(0, 5);
      setStudents(classList);

      // Default attendance entries
      const initEntries: AttendanceStudentEntry[] = classList.map((s, index) => ({
        studentId: s.id,
        scholarNo: s.scholarNo,
        name: s.name,
        rollNo: s.rollNo || `${2400 + index + 1}`,
        status: 'present',
      }));
      setEntries(initEntries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassStudents();
  }, [course, year]);

  const updateStatus = (studentId: string, status: 'present' | 'absent' | 'leave') => {
    setEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status } : e))
    );
  };

  const markAll = (status: 'present' | 'absent') => {
    setEntries((prev) => prev.map((e) => ({ ...e, status })));
  };

  // Metrics
  const total = entries.length;
  const present = entries.filter((e) => e.status === 'present').length;
  const absent = entries.filter((e) => e.status === 'absent').length;
  const onLeave = entries.filter((e) => e.status === 'leave').length;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;

  // Handle Saving Attendance with Offline Caching & Fallback
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setCachedNotice(null);

    const batch: AttendanceBatch = {
      id: `att_${Date.now()}`,
      date,
      course,
      year,
      section,
      subject,
      markedBy: user?.name || 'Faculty Member',
      timestamp: new Date().toISOString(),
      records: entries,
    };

    // If currently known to be disconnected, save directly to local cache
    if (!network.isBrowserOnline || !network.isApiReachable) {
      queueAttendanceBatch(batch, 'ndedu.in API is unreachable (saved offline)');
      refreshQueue();
      setIsSaving(false);
      setCachedNotice(
        language === 'hi'
          ? `उपस्थिति स्थानीय कैश (Offline) में सुरक्षित हो गई है! ndedu.in से संपर्क होते ही यह स्वतः सिंक हो जाएगी।`
          : `Attendance cached locally! Connection to ndedu.in is offline; record will auto-sync when network is restored.`
      );
      setTimeout(() => setCachedNotice(null), 6000);
      return;
    }

    try {
      const res = await erpApi.saveAttendance(batch);
      if (res.success) {
        setSaveSuccess(
          language === 'hi'
            ? `उपस्थिति ERP में सफलतापूर्वक दर्ज हो गई! (कुल: ${total}, उपस्थित: ${present}, अनुपस्थित: ${absent})`
            : `Attendance submitted to ndedu.in ERP! (Total: ${total}, Present: ${present}, Absent: ${absent})`
        );
        setTimeout(() => setSaveSuccess(null), 4500);
      } else {
        // Fallback to offline cache
        queueAttendanceBatch(batch, res.message || 'ERP server rejected batch');
        refreshQueue();
        setCachedNotice(
          language === 'hi'
            ? `सर्वर प्रतिक्रिया धीमी थी। उपस्थिति स्थानीय रूप से सुरक्षित कर ली गई है।`
            : `Server response delayed. Attendance safely cached locally for background retry.`
        );
        setTimeout(() => setCachedNotice(null), 6000);
      }
    } catch (err: any) {
      // Network failure / 502 / timeout: Cache locally for retry
      queueAttendanceBatch(batch, err.message || 'Network error during save');
      refreshQueue();
      setCachedNotice(
        language === 'hi'
          ? `नेटवर्क त्रुटि: उपस्थिति स्थानीय कैश में सुरक्षित है और कनेक्शन बहाल होते ही सिंक होगी।`
          : `Network error: Attendance cached locally and queued for automatic retry.`
      );
      setTimeout(() => setCachedNotice(null), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      const result = await syncPendingAttendanceBatches();
      refreshQueue();
      if (result.synced > 0) {
        setSaveSuccess(
          language === 'hi'
            ? `${result.synced} स्थानीय उपस्थिति रिकॉर्ड्स ndedu.in ERP में सफलतापूर्वक सिंक हो गए!`
            : `Successfully synchronized ${result.synced} offline attendance batch(es) to ndedu.in ERP!`
        );
        setTimeout(() => setSaveSuccess(null), 5000);
      }
      if (result.failed > 0) {
        setCachedNotice(
          language === 'hi'
            ? `${result.failed} रिकॉर्ड सिंक नहीं हो सके (सर्वर त्रुटि)। पुनः प्रयास होगा।`
            : `${result.failed} record(s) could not sync yet. Stored for next retry.`
        );
      }
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleDeleteQueuedBatch = (id: string) => {
    removePendingAttendanceBatch(id);
    refreshQueue();
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Real-time Network Indicator */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.attendancePortal}
            </h1>

            {/* Subtle Connection Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                network.isApiReachable && network.isBrowserOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={network.isApiReachable ? 'Direct connection to ndedu.in FastRoute' : 'API Unreachable - Local Cache Active'}
            >
              {network.isApiReachable && network.isBrowserOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ndedu.in {network.latencyMs ? `(${network.latencyMs}ms)` : 'Online'}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>ndedu.in Offline</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'दैनिक कक्षा उपस्थिति अंकन, सत्यापन एवं स्थानीय ऑफलाइन ऑटो-सिंक'
              : 'Daily class roll call, local offline cache and automatic ndedu.in sync'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Offline Queue Button */}
          {pendingQueue.length > 0 && (
            <button
              onClick={() => setShowQueueModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {language === 'hi' ? 'ऑफलाइन कतार' : 'Offline Queue'} ({pendingQueue.length})
              </span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Offline Records Banner in View if pending items exist */}
      {pendingQueue.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/60 border border-indigo-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-indigo-950 block">
                {language === 'hi'
                  ? `${pendingQueue.length} उपस्थिति रिकॉर्ड्स स्थानीय मेमोरी में सुरक्षित हैं`
                  : `${pendingQueue.length} Attendance Record(s) Cached Locally`}
              </span>
              <span className="text-[11px] text-indigo-700">
                {network.isApiReachable
                  ? (language === 'hi' ? 'ndedu.in ऑनलाइन है! आप इन्हें तुरंत सिंक कर सकते हैं।' : 'ndedu.in is reachable! You can synchronize records now.')
                  : (language === 'hi' ? 'कनेक्शन बहाल होते ही यह स्वतः सिंक हो जाएंगे।' : 'Records will auto-sync once ndedu.in connection is restored.')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing || !network.isApiReachable}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isManualSyncing
                  ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...')
                  : (language === 'hi' ? 'अभी सिंक करें' : 'Sync All to ndedu.in')}
              </span>
            </button>

            <button
              onClick={() => setShowQueueModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-semibold text-xs hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'विवरण देखें' : 'View Queue'}
            </button>
          </div>
        </div>
      )}

      {/* Class Selection Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-medium text-slate-600 mb-1">
            {t.selectCourse}
          </label>
          <select
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              const subs = subjectOptions[e.target.value] || [];
              if (subs.length > 0) setSubject(subs[0]);
            }}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
          >
            <option value="B.A.">B.A. (Arts)</option>
            <option value="B.Sc.">B.Sc. (Science)</option>
            <option value="B.Com.">B.Com. (Commerce)</option>
            <option value="M.A. Hindi">M.A. Hindi</option>
            <option value="M.A. Geography">M.A. Geography</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">
            {t.selectYear}
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
          >
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="Final">Final (PG)</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">
            {t.selectSection}
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="Bio">Bio Group</option>
            <option value="Maths">Maths Group</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">
            {t.selectSubject}
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium truncate"
          >
            {(subjectOptions[course] || []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-Time Attendance Summary Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="text-[11px] text-slate-400 block">{t.totalInClass}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums">{total}</span>
          </div>
          <div className="border-l border-slate-700 pl-4 sm:pl-6">
            <span className="text-[11px] text-emerald-400 block">{t.presentCount}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {present}
            </span>
          </div>
          <div className="border-l border-slate-700 pl-4 sm:pl-6">
            <span className="text-[11px] text-rose-400 block">{t.absentCount}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {absent}
            </span>
          </div>
          <div className="border-l border-slate-700 pl-4 sm:pl-6">
            <span className="text-[11px] text-amber-400 block">{t.percentage}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 tabular-nums">
              {percent}%
            </span>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('present')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.markAllPresent}
          </button>
          <button
            onClick={() => markAll('absent')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            {t.markAllAbsent}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Cached Offline Notification */}
      {cachedNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Database className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{cachedNotice}</span>
        </div>
      )}

      {/* Student Attendance List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>{t.loading}</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No students registered in this class.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry, idx) => (
              <div
                key={entry.studentId}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700">
                    {entry.rollNo || idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {entry.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {entry.scholarNo}
                    </div>
                  </div>
                </div>

                {/* Touch-Friendly Status Selection Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => updateStatus(entry.studentId, 'present')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      entry.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500 ring-offset-1'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'उपस्थित' : 'Present'}</span>
                  </button>

                  <button
                    onClick={() => updateStatus(entry.studentId, 'absent')}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      entry.status === 'absent'
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500 ring-offset-1'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'अनुपस्थित' : 'Absent'}</span>
                  </button>

                  <button
                    onClick={() => updateStatus(entry.studentId, 'leave')}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      entry.status === 'leave'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-2 ring-amber-400 ring-offset-1'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{language === 'hi' ? 'अवकाश' : 'Leave'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span>Subject: </span>
            <strong className="text-slate-800">{subject}</strong>
            <span className="mx-2 text-slate-300">|</span>
            <span className={network.isApiReachable ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
              {network.isApiReachable
                ? 'Online Mode (Direct ERP Sync)'
                : 'Offline Mode (Local Storage Retry)'}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || entries.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t.saving}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>
                  {!network.isApiReachable || !network.isBrowserOnline
                    ? (language === 'hi' ? 'ऑफलाइन सुरक्षित करें' : 'Save Offline (Queue)')
                    : t.saveAttendance}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Offline Queue Modal / Detailed List */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    {language === 'hi' ? 'ऑफलाइन उपस्थिति रिकॉर्ड्स कतार' : 'Offline Attendance Queue'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'hi'
                      ? 'ndedu.in API से संपर्क न होने पर स्थानीय रूप से संचित रिकॉर्ड्स'
                      : 'Records cached locally waiting to synchronize to ndedu.in'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQueueModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {pendingQueue.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">
                    {language === 'hi' ? 'सभी रिकॉर्ड्स सिंक हो चुके हैं!' : 'All attendance records are synchronized!'}
                  </p>
                  <p className="text-slate-400 mt-1">
                    {language === 'hi' ? 'कोई पेंडिंग ऑफलाइन रिकॉर्ड नहीं है।' : 'No pending offline batches in storage.'}
                  </p>
                </div>
              ) : (
                pendingQueue.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/70 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {batch.course} {batch.year} (Section {batch.section})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Subject: <span className="text-slate-700">{batch.subject}</span> · Date: {batch.date}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteQueuedBatch(batch.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Discard record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono mt-1 pt-2 border-t border-slate-200/80">
                      <span>Total: <strong>{batch.records?.length || 0}</strong></span>
                      <span>Present: <strong className="text-emerald-600">{batch.records?.filter(r => r.status === 'present').length || 0}</strong></span>
                      <span>Absent: <strong className="text-rose-600">{batch.records?.filter(r => r.status === 'absent').length || 0}</strong></span>
                      {batch.retryAttempts > 0 && (
                        <span className="ml-auto text-amber-600 text-[10px]">
                          Retries: {batch.retryAttempts}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {pendingQueue.length} {language === 'hi' ? 'रिकॉर्ड्स कतार में' : 'batch(es) queued'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQueueModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>

                {pendingQueue.length > 0 && (
                  <button
                    onClick={handleManualSync}
                    disabled={isManualSyncing || !network.isApiReachable}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                    <span>
                      {isManualSyncing
                        ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...')
                        : (language === 'hi' ? 'अभी सभी सिंक करें' : 'Sync All to ndedu.in')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
