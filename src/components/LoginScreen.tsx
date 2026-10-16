import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CollegeLogo } from './CollegeLogo';
import { CaptchaChallenge } from '../types/erp';
import { erpApi } from '../services/api';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Globe,
  Server,
  RefreshCw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Building,
} from 'lucide-react';

interface LoginScreenProps {
  onOpenApiConfig: () => void;
  onOpenAndroidSpecs: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onOpenApiConfig, onOpenAndroidSpecs }) => {
  const { login, isLoading, connectionStatus, connectionLatency, apiConfig } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [portal, setPortal] = useState<'admin' | 'staff' | 'student'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Live FastRoute CAPTCHA
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isFetchingCaptcha, setIsFetchingCaptcha] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  // Load CAPTCHA on mount
  const loadCaptcha = async () => {
    setIsFetchingCaptcha(true);
    setErrorMsg(null);
    try {
      const challenge = await erpApi.fetchCaptcha();
      if (challenge) {
        setCaptcha(challenge);
        setCaptchaAnswer('');
      }
    } catch (e: any) {
      console.warn('Captcha fetch issue', e);
    } finally {
      setIsFetchingCaptcha(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  // Helper to auto-solve the arithmetic captcha for testing ease
  const autoSolveCaptcha = () => {
    if (!captcha?.question) return;
    try {
      // e.g. "8 + 14"
      const match = captcha.question.match(/(\d+)\s*([\+\-\*])\s*(\d+)/);
      if (match) {
        const num1 = parseInt(match[1]);
        const op = match[2];
        const num2 = parseInt(match[3]);
        let result = 0;
        if (op === '+') result = num1 + num2;
        else if (op === '-') result = num1 - num2;
        else if (op === '*') result = num1 * num2;
        setCaptchaAnswer(String(result));
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNote(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया यूजरनेम और पासवर्ड दोनों दर्ज करें।'
          : 'Please enter both username and password.'
      );
      return;
    }

    if (captcha && !captchaAnswer.trim()) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया सुरक्षा प्रश्न (CAPTCHA) का उत्तर दर्ज करें।'
          : 'Please solve the security CAPTCHA question.'
      );
      return;
    }

    const payload = {
      username: username.trim(),
      password,
      portal,
      rememberMe,
      captcha: captcha ? { ...captcha, answer: captchaAnswer.trim() } : null,
    };

    const res = await login(payload);

    if (!res.success) {
      setErrorMsg(
        res.error ||
          (language === 'hi'
            ? 'लॉगिन असफल रहा। कृपया यूजरनेम व पासवर्ड जांचें।'
            : 'Authentication failed. Please verify credentials.')
      );
      // Refresh captcha on failure as FastRoute invalidates used captchas
      loadCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar with Language and FastRoute API indicator */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300 font-mono tracking-tight flex items-center gap-1.5">
            <span>FastRoute API:</span>
            <span className="text-emerald-400 font-semibold">{apiConfig.baseUrl}</span>
            {connectionLatency !== null && (
              <span className="text-[10px] text-slate-500">({connectionLatency}ms)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition-colors border border-slate-700 cursor-pointer"
            title="भाषा बदलें / Change Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Config Trigger */}
          <button
            onClick={onOpenApiConfig}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700 cursor-pointer"
            title="Configure Backend API URL"
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto px-4 py-4 my-auto">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

          {/* College Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <CollegeLogo size="lg" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1">
              {t.collegeName}
            </h1>
            <p className="text-xs text-amber-400 font-medium">
              {t.collegeLocation}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {t.affiliation}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-serif text-slate-300 italic">
              <span>{t.motto}</span>
            </div>
          </div>

          {/* Portal Switcher (Admin / Staff / Student) */}
          <div className="mb-5">
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              {language === 'hi' ? 'पोर्टल चुनें (Portal Selection):' : 'Select Portal:'}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPortal('admin');
                  setUsername('admin');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  portal === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'hi' ? 'प्राचार्य / Admin' : 'Admin'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortal('staff');
                  setUsername('staff');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  portal === 'staff'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'hi' ? 'शिक्षक / Staff' : 'Staff'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortal('student');
                  setUsername('student');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  portal === 'student'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'hi' ? 'छात्रा / Student' : 'Student'}
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  Route: <code className="font-mono">POST https://ndedu.in/erp/api/auth/login</code>
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t.usernameLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.usernamePlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live FastRoute Math CAPTCHA Box */}
            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>सुरक्षा जांच / Security Question</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={autoSolveCaptcha}
                    className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    title="Solve math equation"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Auto-Solve</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadCaptcha}
                    disabled={isFetchingCaptcha}
                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                    title="Fetch new captcha"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingCaptcha ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 font-mono font-bold text-amber-300 text-sm tracking-widest select-none shrink-0">
                  {captcha?.question ? `${captcha.question} = ?` : 'Loading...'}
                </div>

                <input
                  type="text"
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Answer / उत्तर"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950"
                />
                <span>{t.rememberMe}</span>
              </label>

              <span className="text-[11px] text-amber-400/80 hover:underline cursor-pointer">
                {t.forgotPassword}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t.signingIn}</span>
                </>
              ) : (
                <span>{t.signInButton}</span>
              )}
            </button>
          </form>

          {/* Secure Backend Indicator */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span>ndedu.in FastRoute Online</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/NarayaniDeviGirlsCollegeERP-Android.zip"
                download="NarayaniDeviGirlsCollegeERP-Android.zip"
                className="text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer flex items-center gap-1"
                title="Download NarayaniDeviGirlsCollegeERP-Android.zip"
              >
                <span>Download ZIP</span>
              </a>
              <span>·</span>
              <button
                onClick={onOpenAndroidSpecs}
                className="text-amber-400 hover:text-amber-300 font-medium underline cursor-pointer"
              >
                Kotlin/Android Code
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-slate-500">
        <p>
          © 2025-2026 Narayani Devi Girls College, Sultana, Dist. Jhunjhunu (Rajasthan) · ERP Version 2.4.0
        </p>
      </footer>
    </div>
  );
};
