import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CollegeNotice } from '../types/erp';
import { erpApi } from '../services/api';
import {
  Bell,
  Plus,
  FileText,
  Calendar,
  AlertCircle,
  Download,
  X,
  CheckCircle,
  Megaphone,
} from 'lucide-react';

export const NoticeModule: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [notices, setNotices] = useState<CollegeNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Notice form
  const [newNotice, setNewNotice] = useState({
    title: '',
    titleHi: '',
    content: '',
    contentHi: '',
    category: 'academic' as CollegeNotice['category'],
    priority: 'normal' as CollegeNotice['priority'],
    issuedBy: 'Office of the Principal, NDGC Sultana',
  });
  const [isPosting, setIsPosting] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await erpApi.getNotices();
      setNotices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) return;

    setIsPosting(true);
    try {
      await erpApi.postNotice({
        ...newNotice,
        titleHi: newNotice.titleHi || newNotice.title,
        contentHi: newNotice.contentHi || newNotice.content,
      });
      await fetchNotices();
      setIsModalOpen(false);
      setNewNotice({
        title: '',
        titleHi: '',
        content: '',
        contentHi: '',
        category: 'academic',
        priority: 'normal',
        issuedBy: 'Office of the Principal, NDGC Sultana',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (selectedCategory === 'all') return true;
    return n.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.noticesTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'नारायणी देवी महिला महाविद्यालय - आधिकारिक आदेश, परीक्षा अधिसूचना एवं सर्कुलर'
              : 'Official university circulars, examination schedules, and college announcements'}
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.postNotice}</span>
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl max-w-fit">
        {[
          { key: 'all', label: 'All Notices / सभी' },
          { key: 'exam', label: 'Examinations (परीक्षा)' },
          { key: 'academic', label: 'Academic (शैक्षणिक)' },
          { key: 'fee', label: 'Fee & Scholarship (शुल्क)' },
          { key: 'holiday', label: 'Holidays (अवकाश)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === tab.key
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notice Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>{t.loading}</span>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No notices published under this category yet.
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {notice.noticeNo}
                  </span>
                  {notice.priority === 'urgent' && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {t.urgent}
                    </span>
                  )}
                  <span className="text-slate-400 capitalize">· {notice.category}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{notice.date}</span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
                {language === 'hi' ? notice.titleHi : notice.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {language === 'hi' ? notice.contentHi : notice.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  Issued by: {notice.issuedBy}
                </span>

                {notice.attachmentName && (
                  <button
                    onClick={() =>
                      alert(`Downloading circular document: ${notice.attachmentName}`)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{notice.attachmentName}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {t.publishNoticeModalTitle}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Official circulars are pushed live to faculty and student dashboards.
            </p>

            <form onSubmit={handlePostNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.noticeSubject} (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="e.g. University Examination Form Schedule"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.noticeSubject} (हिन्दी)
                </label>
                <input
                  type="text"
                  value={newNotice.titleHi}
                  onChange={(e) => setNewNotice({ ...newNotice, titleHi: e.target.value })}
                  placeholder="उदा. विश्वविद्यालय परीक्षा फॉर्म भरने संबंधी आवश्यक सूचना"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.noticeCategory}
                  </label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="academic">Academic</option>
                    <option value="exam">Examination</option>
                    <option value="fee">Fee & Dues</option>
                    <option value="holiday">Holiday</option>
                    <option value="event">Cultural / Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.noticeBody} (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Enter detailed notice contents..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.noticeBody} (हिन्दी)
                </label>
                <textarea
                  rows={3}
                  value={newNotice.contentHi}
                  onChange={(e) => setNewNotice({ ...newNotice, contentHi: e.target.value })}
                  placeholder="विस्तृत विवरण हिन्दी में लिखें..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  {isPosting ? <span>{t.saving}</span> : <span>{t.broadcastNotice}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
