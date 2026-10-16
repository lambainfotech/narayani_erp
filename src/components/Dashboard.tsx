import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NavTab } from './Navbar';
import { erpApi } from '../services/api';
import { Student, FeeReceipt, CollegeNotice } from '../types/erp';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  Users,
  CreditCard,
  ClipboardCheck,
  Bell,
  ArrowUpRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  Database,
  CloudOff,
} from 'lucide-react';

interface DashboardProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenAdmissionModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTab, onOpenAdmissionModal }) => {
  const { user, apiConfig } = useAuth();
  const { t, language } = useLanguage();
  const network = useNetworkStatus();

  const [students, setStudents] = useState<Student[]>([]);
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [notices, setNotices] = useState<CollegeNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [stdList, recList, ntcList] = await Promise.all([
          erpApi.getStudents(),
          erpApi.getReceipts(),
          erpApi.getNotices(),
        ]);
        setStudents(stdList);
        setReceipts(recList);
        setNotices(ntcList);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics
  const totalStudents = students.length;
  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendanceRate || 85), 0) / students.length)
    : 89;
  const totalFeesCollected = receipts.reduce((acc, r) => acc + r.paidAmount, 0);
  const totalPendingDues = students.reduce((acc, s) => acc + (s.feeBalance || 0), 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="space-y-6">
      {/* College Hero Banner & Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-amber-300 font-medium">
            <span className="bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
              {t.session}
            </span>
            <span>·</span>
            <span>{t.collegeLocation}</span>
            <span>·</span>
            <span
              className={`flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${
                network.isApiReachable && network.isBrowserOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
              }`}
            >
              {network.isApiReachable && network.isBrowserOnline ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ndedu.in Live {network.latencyMs ? `(${network.latencyMs}ms)` : ''}</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span>ndedu.in Offline (Local Cache)</span>
                </>
              )}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            {t.welcomeBack},{' '}
            <span className="text-amber-400">
              {language === 'hi' && user?.nameHi ? user.nameHi : user?.name || 'Administrator'}
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mb-6">
            {t.collegeTagline} · {t.affiliation}. {language === 'hi' ? 'महाविद्यालय की समस्त प्रशासनिक, शैक्षणिक एवं वित्तीय गतिविधियों का केंद्रीय नियंत्रण।' : 'Centralized management of admissions, fees, daily attendance, notices, and university remissions.'}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {(user?.role === 'admin' || user?.role === 'accountant') && (
              <button
                onClick={() => onSelectTab('fees')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t.collectFeeNow}</span>
              </button>
            )}

            {(user?.role === 'admin' || user?.role === 'faculty') && (
              <button
                onClick={() => onSelectTab('attendance')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                <span>{t.markAttendanceNow}</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={onOpenAdmissionModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>{t.newAdmissionNow}</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('notices')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700/60 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>{t.announcements}</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark Emblem */}
        <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none hidden md:block">
          <GraduationCap className="w-64 h-64 text-indigo-200 -rotate-12" />
        </div>
      </div>

      {/* KPI Stat Cards (Tabular figures, clean unboxed metadata) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled */}
        <div
          onClick={() => onSelectTab('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.totalStudents}</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {totalStudents}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>B.A. · B.Sc. · B.Com · M.A.</span>
          </div>
        </div>

        {/* Card 2: Attendance % */}
        <div
          onClick={() => onSelectTab('attendance')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.todayAttendance}</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {avgAttendance}%
          </div>
          <div className="mt-2 flex items-center justify-between gap-1 text-xs">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Regular attendance on track</span>
            </span>

            {network.pendingAttendanceCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>{network.pendingAttendanceCount} cached</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Fees Collected */}
        <div
          onClick={() => onSelectTab('fees')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.feeCollectedToday}</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {formatCurrency(totalFeesCollected)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>{receipts.length} verified receipts issued</span>
          </div>
        </div>

        {/* Card 4: Pending Dues */}
        <div
          onClick={() => onSelectTab('fees')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.pendingDues}</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {formatCurrency(totalPendingDues)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <span>Installment dues alert active</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Fee Transactions & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Transactions */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.recentReceipts}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'हाल में जारी आधिकारिक शुल्क रसीदें' : 'Latest fee collection receipts with verification'}
              </p>
            </div>
            <button
              onClick={() => onSelectTab('fees')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {receipts.slice(0, 4).map((rec) => (
              <div key={rec.receiptNo} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {rec.studentName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {rec.scholarNo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{rec.course} · {rec.year}</span>
                    <span>·</span>
                    <span>{rec.date}</span>
                    <span>·</span>
                    <span className="text-slate-600 font-medium">{rec.paymentMode}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                    +{formatCurrency(rec.paidAmount)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {rec.receiptNo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* College Notice Board */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.announcements}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'प्राचार्य कार्यालय द्वारा जारी आधिकारिक सूचनाएं' : 'Principal office circulars and academic schedules'}
              </p>
            </div>
            <button
              onClick={() => onSelectTab('notices')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.id} className="py-3.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                  <div className="flex items-center gap-2">
                    {notice.priority === 'urgent' && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        {t.urgent}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-400">
                      {notice.noticeNo}
                    </span>
                  </div>
                  <span>{notice.date}</span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                  {language === 'hi' ? notice.titleHi : notice.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'hi' ? notice.contentHi : notice.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
