import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types/erp';
import { erpApi } from '../services/api';
import {
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  X,
  FileText,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

interface StudentModuleProps {
  onCollectFeeForStudent: (student: Student) => void;
  isAdmissionModalOpen: boolean;
  setIsAdmissionModalOpen: (open: boolean) => void;
}

export const StudentModule: React.FC<StudentModuleProps> = ({
  onCollectFeeForStudent,
  isAdmissionModalOpen,
  setIsAdmissionModalOpen,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // New Admission Form State
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dob: '2006-05-15',
    mobile: '',
    email: '',
    course: 'B.A.' as Student['course'],
    year: '1st Year' as Student['year'],
    section: 'A',
    category: 'General' as Student['category'],
    address: 'Sultana, Jhunjhunu',
    previousMarks: '76.4%',
    aadharNo: '',
    feeTotal: 18500,
    feePaid: 10000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await erpApi.getStudents(searchQuery, selectedCourse, selectedYear);
      let filtered = data;
      if (selectedCategory !== 'All') {
        filtered = filtered.filter((s) => s.category === selectedCategory);
      }
      setStudents(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, selectedCourse, selectedYear, selectedCategory]);

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim() || !formData.fatherName.trim() || !formData.mobile.trim()) {
      setFormError(language === 'hi' ? 'कृपया सभी अनिवार्य विवरण भरें।' : 'Please fill all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await erpApi.registerAdmission({
        ...formData,
        admissionDate: new Date().toISOString().split('T')[0],
        gender: 'Female',
        feeTotal: Number(formData.feeTotal),
        feePaid: Number(formData.feePaid),
      });

      if (res.success) {
        setFormSuccess(
          language === 'hi'
            ? `प्रवेश सफल! आवंटित स्कॉलर संख्या: ${res.student.scholarNo}`
            : `Admission Registered! Scholar No: ${res.student.scholarNo}`
        );
        fetchStudents();
        setTimeout(() => {
          setIsAdmissionModalOpen(false);
          setFormSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating admission record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.studentDirectory}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'महाविद्यालय में अध्ययनरत नियमित छात्राओं का रिकॉर्ड व विवरण'
              : 'Enrolled students roster, scholar records, and fee status'}
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setIsAdmissionModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addStudent}</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchStudentPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t.course}
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">{t.courseFilter}</option>
              <option value="B.A.">B.A.</option>
              <option value="B.Sc.">B.Sc.</option>
              <option value="B.Com.">B.Com.</option>
              <option value="M.A. Hindi">M.A. Hindi</option>
              <option value="M.A. Geography">M.A. Geography</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t.year}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">{t.yearFilter}</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="Final">Final (PG)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t.category}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">{t.categoryFilter}</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCourse('All');
                setSelectedYear('All');
                setSelectedCategory('All');
              }}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Student List View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {t.totalRecords}: <strong className="text-slate-900 font-mono">{students.length}</strong>
          </span>
          <span className="hidden sm:inline">Narayani Devi Girls College ERP</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>{t.loading}</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <p>{t.noStudentsFound}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">{t.scholarNo}</th>
                    <th className="py-3 px-4 font-semibold">{t.studentName}</th>
                    <th className="py-3 px-4 font-semibold">{t.fatherName}</th>
                    <th className="py-3 px-4 font-semibold">{t.course}</th>
                    <th className="py-3 px-4 font-semibold">{t.mobile}</th>
                    <th className="py-3 px-4 font-semibold text-right">{t.balance}</th>
                    <th className="py-3 px-4 font-semibold text-center">{t.attendance}</th>
                    <th className="py-3 px-4 font-semibold text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-700">
                        {student.scholarNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {student.name}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {student.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{student.fatherName}</td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {student.course} · {student.year}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{student.mobile}</td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {student.feeBalance > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            {formatCurrency(student.feeBalance)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Cleared</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            student.attendanceRate >= 85
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {student.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors cursor-pointer"
                          >
                            {t.viewDetails}
                          </button>
                          {(user?.role === 'admin' || user?.role === 'accountant') && (
                            <button
                              onClick={() => onCollectFeeForStudent(student)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded text-xs transition-colors cursor-pointer"
                            >
                              {t.collectFeeAction}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (optimized for touch ergonomics) */}
            <div className="md:hidden divide-y divide-slate-100">
              {students.map((student) => (
                <div key={student.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold text-indigo-600">
                        {student.scholarNo}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {student.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        C/o {student.fatherName}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {student.course}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {student.year}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <div className="text-slate-600">
                      <span>Dues: </span>
                      <strong
                        className={
                          student.feeBalance > 0
                            ? 'text-rose-600 font-mono'
                            : 'text-emerald-700 font-mono'
                        }
                      >
                        {formatCurrency(student.feeBalance)}
                      </strong>
                    </div>

                    <div className="text-slate-600">
                      <span>Att: </span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {student.attendanceRate}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="flex-1 min-h-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      {t.viewDetails}
                    </button>
                    {(user?.role === 'admin' || user?.role === 'accountant') && (
                      <button
                        onClick={() => onCollectFeeForStudent(student)}
                        className="flex-1 min-h-[44px] flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs cursor-pointer"
                      >
                        {t.collectFeeAction}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Student Details Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-600">
                  {selectedStudent.scholarNo}
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedStudent.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedStudent.course} · {selectedStudent.year} (Section {selectedStudent.section})
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">{t.fatherName}</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.fatherName}</p>
                </div>
                <div>
                  <span className="text-slate-500">{t.motherName}</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.motherName}</p>
                </div>
              </div>

              <div className="pt-3 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">{t.dob}</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.dob}</p>
                </div>
                <div>
                  <span className="text-slate-500">{t.category}</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.category}</p>
                </div>
              </div>

              <div className="pt-3 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">{t.mobile}</span>
                  <p className="font-semibold text-slate-800 font-mono">{selectedStudent.mobile}</p>
                </div>
                <div>
                  <span className="text-slate-500">{t.enrollmentNo}</span>
                  <p className="font-semibold text-slate-800 font-mono">{selectedStudent.enrollmentNo}</p>
                </div>
              </div>

              <div className="pt-3">
                <span className="text-slate-500">{t.address}</span>
                <p className="font-semibold text-slate-800">{selectedStudent.address}</p>
              </div>

              <div className="pt-3 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-slate-500 text-[10px]">Total Fee</span>
                  <p className="font-bold text-slate-800 font-mono">
                    {formatCurrency(selectedStudent.feeTotal)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Fee Paid</span>
                  <p className="font-bold text-emerald-700 font-mono">
                    {formatCurrency(selectedStudent.feePaid)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Balance Due</span>
                  <p className="font-bold text-rose-600 font-mono">
                    {formatCurrency(selectedStudent.feeBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {(user?.role === 'admin' || user?.role === 'accountant') && (
                <button
                  onClick={() => {
                    const s = selectedStudent;
                    setSelectedStudent(null);
                    onCollectFeeForStudent(s);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.collectFeeAction}</span>
                </button>
              )}
              <button
                onClick={() => setSelectedStudent(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Admission Modal Form */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAdmissionModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t.admissionTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'नारायणी देवी महिला महाविद्यालय, सुल्ताना - सत्र 2025-26'
                  : 'Narayani Devi Girls College, Sultana - Academic Session 2025-26'}
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdmissionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.studentName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Komal Kanwar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.fatherName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Father's Full Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.motherName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="Mother's Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.dob} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.course} *
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="B.A.">B.A. (Arts)</option>
                    <option value="B.Sc.">B.Sc. (Science)</option>
                    <option value="B.Com.">B.Com. (Commerce)</option>
                    <option value="M.A. Hindi">M.A. Hindi</option>
                    <option value="M.A. Geography">M.A. Geography</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.year} *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final">Final (PG)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.category} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="MBC">MBC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.mobile} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit Mobile No."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t.aadharNo}
                  </label>
                  <input
                    type="text"
                    value={formData.aadharNo}
                    onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })}
                    placeholder="12-digit Aadhaar No."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {t.address}
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Village / Town, Post, District, Pin code"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <div>
                  <label className="block font-medium text-indigo-950 mb-1">
                    Total Annual Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.feeTotal}
                    onChange={(e) => setFormData({ ...formData, feeTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-indigo-950 mb-1">
                    Initial Fee Received at Admission (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.feePaid}
                    onChange={(e) => setFormData({ ...formData, feePaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg font-mono font-semibold text-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdmissionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.saving}</span>
                    </>
                  ) : (
                    <span>{t.submitAdmission}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
