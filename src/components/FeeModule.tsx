import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Student, FeeReceipt, FeeHead } from '../types/erp';
import { erpApi } from '../services/api';
import { FeeReceiptModal } from './FeeReceiptModal';
import {
  CreditCard,
  Search,
  Printer,
  CheckCircle,
  AlertCircle,
  Receipt,
  FileCheck,
  Calendar,
  IndianRupee,
  ChevronRight,
  User,
} from 'lucide-react';

interface FeeModuleProps {
  initialStudent?: Student | null;
}

export const FeeModule: React.FC<FeeModuleProps> = ({ initialStudent }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(initialStudent || null);
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<FeeReceipt | null>(null);

  // Search
  const [studentSearch, setStudentSearch] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');

  // Fee collection form state
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI / QR' | 'Net Banking' | 'Cheque / DD'>('UPI / QR');
  const [transactionRef, setTransactionRef] = useState('UPI/529811409');
  const [remarks, setRemarks] = useState('College fee installment received');
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Customizable Fee Heads Breakdown
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([
    { name: 'Tuition Fee', nameHi: 'शिक्षण शुल्क', amount: 8000 },
    { name: 'Practical & Lab Fee', nameHi: 'प्रयोगशाला शुल्क', amount: 3000 },
    { name: 'Library & Reading Room', nameHi: 'पुस्तकालय शुल्क', amount: 1500 },
    { name: 'Campus Development Fund', nameHi: 'महाविद्यालय विकास कोष', amount: 1500 },
  ]);

  useEffect(() => {
    async function loadData() {
      const [stds, recs] = await Promise.all([erpApi.getStudents(), erpApi.getReceipts()]);
      setStudents(stds);
      setReceipts(recs);
      if (initialStudent) {
        setSelectedStudent(initialStudent);
        setAmountToPay(initialStudent.feeBalance > 0 ? Math.min(initialStudent.feeBalance, 10000) : 5000);
      } else if (stds.length > 0) {
        setSelectedStudent(stds[1]); // Anjali Kumari Saini who has balance
        setAmountToPay(stds[1].feeBalance > 0 ? stds[1].feeBalance : 5000);
      }
    }
    loadData();
  }, [initialStudent]);

  const handleSelectStudent = (s: Student) => {
    setSelectedStudent(s);
    setStudentSearch('');
    const suggestedPay = s.feeBalance > 0 ? s.feeBalance : 5000;
    setAmountToPay(suggestedPay);
    // Adapt default fee heads to student course
    if (s.course.includes('Science') || s.course.includes('B.Sc.')) {
      setFeeHeads([
        { name: 'Tuition Fee', nameHi: 'शिक्षण शुल्क', amount: Math.round(suggestedPay * 0.6) },
        { name: 'Practical & Lab Fee', nameHi: 'प्रयोगशाला शुल्क', amount: Math.round(suggestedPay * 0.25) },
        { name: 'Library & Reading Room', nameHi: 'पुस्तकालय शुल्क', amount: Math.round(suggestedPay * 0.15) },
      ]);
    } else {
      setFeeHeads([
        { name: 'Tuition Fee', nameHi: 'शिक्षण शुल्क', amount: Math.round(suggestedPay * 0.7) },
        { name: 'University Examination Fee', nameHi: 'विश्वविद्यालय परीक्षा शुल्क', amount: Math.round(suggestedPay * 0.2) },
        { name: 'Library & Development', nameHi: 'पुस्तकालय व विकास कोष', amount: Math.round(suggestedPay * 0.1) },
      ]);
    }
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (amountToPay <= 0) {
      setMessage({
        type: 'error',
        text: language === 'hi' ? 'कृपया मान्य भुगतान राशि दर्ज करें।' : 'Please enter a valid payment amount.',
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await erpApi.collectFee({
        studentId: selectedStudent.id,
        paidAmount: Number(amountToPay),
        paymentMode,
        transactionId: paymentMode !== 'Cash' ? transactionRef : undefined,
        remarks,
        heads: feeHeads,
      });

      if (res.success && res.receipt) {
        // Refresh receipts and selected student status
        const updatedRecs = await erpApi.getReceipts();
        setReceipts(updatedRecs);
        const updatedStds = await erpApi.getStudents();
        setStudents(updatedStds);
        const currentUpdated = updatedStds.find((s) => s.id === selectedStudent.id);
        if (currentUpdated) setSelectedStudent(currentUpdated);

        setMessage({
          type: 'success',
          text:
            language === 'hi'
              ? `शुल्क सफलतापूर्वक जमा हो गया! रसीद संख्या: ${res.receipt.receiptNo}`
              : `Payment recorded successfully! Receipt: ${res.receipt.receiptNo}`,
        });

        // Open Printable Receipt
        setActiveReceipt(res.receipt);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payment recording failed' });
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

  const filteredReceipts = receipts.filter((r) => {
    if (!receiptSearch) return true;
    const q = receiptSearch.toLowerCase();
    return (
      r.receiptNo.toLowerCase().includes(q) ||
      r.studentName.toLowerCase().includes(q) ||
      r.scholarNo.toLowerCase().includes(q)
    );
  });

  const matchingStudents = studentSearch.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.scholarNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.mobile.includes(studentSearch)
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.feePortal}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'नारायणी देवी महिला महाविद्यालय - शुल्क संकलन, चालान एवं आधिकारिक रसीद'
              : 'Direct tuition fee collection, online ledger, and verified print receipts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Session:</span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            2025-2026
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Selection & Payment Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Student Selector Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              1. {t.searchStudentForFee}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Type Scholar No (e.g. 2025/BSC/0204) or Student Name..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Matching dropdown */}
            {studentSearch.trim() && (
              <div className="absolute left-5 right-5 top-[84px] z-20 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                {matchingStudents.length > 0 ? (
                  matchingStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className="p-3 hover:bg-amber-50/70 transition-colors cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{s.name}</span>
                        <span className="ml-2 font-mono text-slate-500">{s.scholarNo}</span>
                        <div className="text-[11px] text-slate-400">
                          {s.course} · {s.year} · C/o {s.fatherName}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-rose-600 font-bold">
                          Due: {formatCurrency(s.feeBalance)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching student found
                  </div>
                )}
              </div>
            )}

            {/* Currently Selected Student Card */}
            {selectedStudent ? (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {selectedStudent.name}
                      </h3>
                      <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {selectedStudent.scholarNo}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {selectedStudent.course} - {selectedStudent.year} · Father: {selectedStudent.fatherName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Current Balance Due:</span>
                  <span className="font-mono font-bold text-sm text-rose-600">
                    {formatCurrency(selectedStudent.feeBalance)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                Please search and select a student to record fee collection
              </div>
            )}
          </div>

          {/* Payment Details Form */}
          {selectedStudent && (
            <form onSubmit={handleFeeSubmit} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">
                2. {language === 'hi' ? 'भुगतान विवरण एवं मद विभाजन' : 'Fee Particulars & Payment Submission'}
              </h2>

              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Amount & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.amountPaid} *
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedStudent.feeBalance > 0 ? selectedStudent.feeBalance * 1.5 : 50000}
                      value={amountToPay}
                      onChange={(e) => setAmountToPay(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.paymentMode} *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="UPI / QR">UPI / QR (PhonePe / GPay / Paytm)</option>
                    <option value="Cash">Cash (नकद भुगतान)</option>
                    <option value="Net Banking">Net Banking / NEFT / IMPS</option>
                    <option value="Cheque / DD">Bank Demand Draft / Cheque</option>
                  </select>
                </div>
              </div>

              {paymentMode !== 'Cash' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.transactionRef} *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UTR / UPI Ref ID / Cheque No."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.cashierRemarks}
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Second installment paid with library clearance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Fee Particulars Table */}
              <div className="pt-2">
                <span className="block text-xs font-medium text-slate-600 mb-2">
                  {t.feeBreakdown}:
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-semibold text-slate-700 flex justify-between">
                    <span>Head / मद</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {feeHeads.map((h, i) => (
                      <div key={i} className="px-3 py-2 flex items-center justify-between text-slate-700">
                        <span>
                          {h.name} <small className="text-slate-400">({h.nameHi})</small>
                        </span>
                        <span className="font-mono font-semibold">{formatCurrency(h.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{t.saving}</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>{t.generateReceipt}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Recent Transactions & Receipts Ledger (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">
                {t.recentReceipts}
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {receipts.length} entries
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                placeholder="Search receipt no or student..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto pr-1">
              {filteredReceipts.map((rec) => (
                <div
                  key={rec.receiptNo}
                  className="py-3 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 p-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 truncate">
                        {rec.studentName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {rec.receiptNo} · {rec.date}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {rec.course} · {rec.paymentMode}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="font-bold text-emerald-700 font-mono">
                        {formatCurrency(rec.paidAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bal: {formatCurrency(rec.balanceDue)}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveReceipt(rec)}
                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                      title="View & Print Official Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <FeeReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
};
