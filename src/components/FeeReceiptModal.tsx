import React from 'react';
import { FeeReceipt } from '../types/erp';
import { useLanguage } from '../context/LanguageContext';
import { CollegeLogo } from './CollegeLogo';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface FeeReceiptModalProps {
  receipt: FeeReceipt | null;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({ receipt, onClose }) => {
  const { t, language } = useLanguage();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Convert numbers to words in Indian numbering system
  const numberToWords = (num: number): string => {
    const a = [
      '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
      'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      let str = '';
      if (n > 9999999) {
        str += inWords(Math.floor(n / 10000000)) + 'Crore ';
        n %= 10000000;
      }
      if (n > 99999) {
        str += inWords(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (n > 999) {
        str += inWords(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (n > 99) {
        str += inWords(Math.floor(n / 100)) + 'Hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (str !== '') str += 'and ';
        if (n < 20) str += a[n];
        else {
          str += b[Math.floor(n / 10)];
          if (n % 10 > 0) str += ' ' + a[n % 10];
        }
      }
      return str;
    };

    const words = inWords(num);
    return words ? `Rupees ${words.trim()} Only` : 'Rupees Zero Only';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official College Fee Receipt (सत्यापित शुल्क रसीद)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printReceipt}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div
          id="printable-receipt"
          className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 bg-amber-50/20 text-slate-900 relative overflow-hidden"
        >
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <CollegeLogo size="xl" />
          </div>

          {/* College Header */}
          <div className="text-center pb-4 border-b-2 border-slate-800">
            <div className="flex justify-center mb-2">
              <CollegeLogo size="md" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-slate-950 font-serif">
              NARAYANI DEVI GIRLS COLLEGE, SULTANA
            </h1>
            <p className="text-sm font-semibold text-slate-800">
              नारायणी देवी महिला महाविद्यालय, सुल्ताना (झुंझुनूं, राज.)
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Affiliated to Pandit Deendayal Upadhyaya Shekhawati University, Sikar
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-mono">
              <span>Motto: विद्यया अमृतमश्नुते</span>
              <span>·</span>
              <span>Session: {receipt.session}</span>
            </div>
          </div>

          {/* Receipt Meta Strip */}
          <div className="py-3 border-b border-dashed border-slate-400 flex flex-wrap items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500">Receipt No: </span>
              <strong className="text-slate-900 font-bold">{receipt.receiptNo}</strong>
            </div>
            <div>
              <span className="text-slate-500">Date: </span>
              <strong className="text-slate-900 font-bold">{receipt.date}</strong>
            </div>
          </div>

          {/* Student Information Grid */}
          <div className="py-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-b border-slate-300">
            <div>
              <span className="text-slate-500 block text-[11px]">Scholar Number:</span>
              <span className="font-mono font-bold text-slate-900">{receipt.scholarNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Student Name:</span>
              <span className="font-bold text-slate-900 uppercase">{receipt.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Father's Name:</span>
              <span className="font-semibold text-slate-800">{receipt.fatherName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Class / Course:</span>
              <span className="font-semibold text-slate-800">{receipt.course} - {receipt.year}</span>
            </div>
          </div>

          {/* Fee Heads Breakdown Table */}
          <div className="py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-700">
                  <th className="py-2 text-left font-bold">S.No.</th>
                  <th className="py-2 text-left font-bold">Fee Particulars (मद विवरण)</th>
                  <th className="py-2 text-right font-bold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receipt.heads.map((head, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-2 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 font-medium text-slate-800">
                      {head.name}{' '}
                      <span className="text-slate-500 text-[11px]">({head.nameHi})</span>
                    </td>
                    <td className="py-2 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(head.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-800">
                <tr>
                  <td colSpan={2} className="py-2 text-right font-bold text-slate-900">
                    Net Amount Paid Today:
                  </td>
                  <td className="py-2 text-right font-mono font-extrabold text-base text-slate-950">
                    {formatCurrency(receipt.paidAmount)}
                  </td>
                </tr>
                {receipt.balanceDue > 0 ? (
                  <tr>
                    <td colSpan={2} className="py-1 text-right text-xs text-rose-600 font-medium">
                      Remaining Dues for Session:
                    </td>
                    <td className="py-1 text-right font-mono text-xs text-rose-600 font-bold">
                      {formatCurrency(receipt.balanceDue)}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={2} className="py-1 text-right text-xs text-emerald-700 font-medium">
                      Full Year Fee Settlement:
                    </td>
                    <td className="py-1 text-right font-mono text-xs text-emerald-700 font-bold">
                      Nil (Dues Cleared)
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>

            {/* In Words */}
            <div className="mt-3 p-2.5 bg-slate-100/80 rounded-lg text-xs">
              <span className="text-slate-500">In Words: </span>
              <strong className="text-slate-900 font-serif italic">
                {numberToWords(receipt.paidAmount)}
              </strong>
            </div>

            {/* Payment Details */}
            <div className="mt-3 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span>Payment Mode: </span>
                <strong className="text-slate-900 font-medium">{receipt.paymentMode}</strong>
                {receipt.transactionId && (
                  <span className="font-mono ml-1 text-slate-500">
                    (Ref: {receipt.transactionId})
                  </span>
                )}
              </div>
              {receipt.remarks && (
                <div>
                  <span>Note: {receipt.remarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="mt-8 pt-8 border-t border-slate-300 grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <div className="h-8 flex items-end justify-center">
                <span className="border-b border-dotted border-slate-500 w-32 inline-block"></span>
              </div>
              <p className="mt-1 font-medium text-slate-700">Depositor Signature</p>
            </div>

            <div>
              <div className="h-8 flex items-end justify-center font-serif text-[11px] text-indigo-900 italic font-bold">
                Sh. Suresh Kumar Lamba
              </div>
              <p className="mt-1 font-bold text-slate-900">
                Authorized Signatory / Cashier
              </p>
              <p className="text-[10px] text-slate-500">
                Narayani Devi Girls College, Sultana
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
