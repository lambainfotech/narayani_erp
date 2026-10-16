import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CollegeLogo } from './CollegeLogo';
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  KeyRound,
  Server,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface ProfileModuleProps {
  onOpenApiConfig: () => void;
  onOpenAndroidSpecs: () => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ onOpenApiConfig, onOpenAndroidSpecs }) => {
  const { user, token, logout, apiConfig, connectionStatus } = useAuth();
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.collegeProfile}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'सत्र विवरण, संस्थान परिचय एवं अधिकृत उपयोगकर्ता सत्र'
              : 'Institutional accreditation, user session credentials, and contact registry'}
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.logout}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Account Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xl flex items-center justify-center shadow-md">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {user?.role}
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-tight mt-1">
                  {language === 'hi' && user?.nameHi ? user.nameHi : user?.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {user?.username} · {user?.department || 'College Staff'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Designation:</span>
                <strong className="text-slate-800">{user?.designation || 'Staff'}</strong>
              </div>

              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700">{user?.email}</span>
              </div>

              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-mono text-slate-700">{user?.phone}</span>
              </div>

              {user?.scholarNo && (
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Scholar No.:</span>
                  <span className="font-mono font-bold text-indigo-600">{user.scholarNo}</span>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-500">Active Token:</span>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[140px]">
                  {token?.slice(0, 18)}...
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={onOpenApiConfig}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>API Settings</span>
              </button>
              <button
                onClick={onOpenAndroidSpecs}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kotlin Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* College Institutional Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <CollegeLogo size="lg" />
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {t.collegeFullName}
                </h2>
                <p className="text-xs text-amber-700 font-semibold">
                  नारायणी देवी महिला महाविद्यालय, सुल्ताना (झुंझुनूं)
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.affiliation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Campus Location</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Chirawa Road, Sultana, Tehsil - Chirawa, District - Jhunjhunu, Rajasthan - 333028
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Affiliation & Recognition</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pandit Deendayal Upadhyaya Shekhawati University, Sikar (NCTE & College Directorate Approved)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Office Helpline</span>
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  01596-294025 / +91 9414012345
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Server className="w-3.5 h-3.5" />
                  <span>ERP Backend Portal</span>
                </div>
                <a
                  href="https://ndedu.in/erp/login"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 font-mono hover:underline flex items-center gap-1"
                >
                  <span>https://ndedu.in/erp/login</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="mt-5 p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-950">
              <span className="font-bold block mb-1">
                महाविद्यालय का ध्येय वाक्य (Motto):
              </span>
              <p className="font-serif italic text-sm text-amber-900">
                "विद्यया अमृतमश्नुते" — ज्ञान से ही अमरत्व और वास्तविक मुक्ति की प्राप्ति होती है।
              </p>
              <p className="mt-1 text-[11px] text-amber-800">
                ग्रामीण एवं अर्ध-शहरी अंचल की बालिकाओं को उच्च स्तरीय, सुरक्षित एवं संस्कारयुक्त शिक्षा उपलब्ध करवाना महाविद्यालय का प्रमुख संकल्प है।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
