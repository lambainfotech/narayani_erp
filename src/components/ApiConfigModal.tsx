import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Server,
  X,
  RotateCcw,
  Globe,
  Activity,
  Code2,
} from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAndroidSpecs: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onOpenAndroidSpecs,
}) => {
  const { apiConfig, setApiConfig, resetApiConfig } = useAuth();
  const { t } = useLanguage();

  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [apiPrefix, setApiPrefix] = useState(apiConfig.apiPrefix);
  const [useProxy, setUseProxy] = useState(apiConfig.useProxy);
  const [timeoutMs, setTimeoutMs] = useState(apiConfig.timeoutMs);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    status?: number;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiConfig({
      ...apiConfig,
      baseUrl: baseUrl.trim(),
      apiPrefix: apiPrefix.trim(),
      useProxy,
      timeoutMs: Number(timeoutMs),
    });
    onClose();
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = Date.now();
    try {
      const res = await fetch('/api/test-connection');
      const data = await res.json();
      setTestResult({
        success: data.success,
        latencyMs: data.latencyMs || Date.now() - start,
        status: data.status,
        error: data.error,
      });
    } catch (e: any) {
      setTestResult({
        success: false,
        error: e.message || 'Failed to ping ERP server',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    resetApiConfig();
    setBaseUrl('https://ndedu.in/erp');
    setApiPrefix('/api');
    setUseProxy(true);
    setTimeoutMs(12000);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {t.apiConfigTitle}
            </h2>
            <p className="text-xs text-slate-500">
              FastRoute PHP Backend: Narayani Devi Girls College, Sultana
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Base URL */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              {t.baseUrlLabel} *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                required
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://ndedu.in/erp"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              ERP Server Root: <code className="font-mono text-indigo-600">https://ndedu.in/erp</code>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                API Prefix
              </label>
              <input
                type="text"
                value={apiPrefix}
                onChange={(e) => setApiPrefix(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Timeout (ms)
              </label>
              <input
                type="number"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Proxy switch for Web browser preview */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="proxyCheck"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="proxyCheck" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-semibold block text-slate-900">
                Use CORS-Safe Web Proxy (/api/erp/*)
              </span>
              <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                Bypasses browser CORS constraints while connecting to FastRoute PHP at ndedu.in. In native Android Kotlin / Flutter, direct HTTPS connections are made.
              </span>
            </label>
          </div>

          {/* Test Connection Box */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800">Connection Diagnostics</span>
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Testing...' : t.testConnection}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-mono border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>Status: {testResult.success ? 'Reachable' : 'Unreachable'}</span>
                  {testResult.latencyMs !== undefined && (
                    <span>Latency: {testResult.latencyMs}ms</span>
                  )}
                </div>
                {testResult.status && (
                  <div className="text-[11px] mt-1">HTTP Response Code: {testResult.status}</div>
                )}
                {testResult.error && (
                  <div className="text-[11px] text-rose-700 mt-1">{testResult.error}</div>
                )}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAndroidSpecs();
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>API Specs</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
