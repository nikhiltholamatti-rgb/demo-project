import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle, Copy, Check, ExternalLink, RefreshCw, AlertCircle, Shield } from 'lucide-react';
import { testSupabaseConnection, SUPABASE_APPOINTMENTS_SQL, db } from '../../lib/supabase';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    hasAppointmentsTable: boolean;
    message: string;
  } | null>(null);

  const appointments = db.appointments.getAll();

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        connected: false,
        hasAppointmentsTable: false,
        message: e?.message || 'Connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_APPOINTMENTS_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#1a1613] border-2 border-[#524132] rounded-2xl p-6 sm:p-8 shadow-2xl text-[#ede5d8] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27201b] border border-[#3e3227] text-[#baa794] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-2xl text-[#f5ebd7]">Supabase Backend Integration</h3>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#b8a693]">
              Direct connection configured for appointment bookings & data persistence
            </p>
          </div>
        </div>

        {/* Connection Credentials Card */}
        <div className="bg-[#241e19] border border-[#3e3227] rounded-xl p-4 mb-5 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center py-1 border-b border-[#352a21]">
            <span className="text-[#a89682]">Project ID:</span>
            <span className="text-[#f5ebd7] font-semibold bg-[#181310] px-2 py-0.5 rounded border border-[#3b2f24]">
              uegznkmvmaqstwvujfnx
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#352a21]">
            <span className="text-[#a89682]">API Endpoint:</span>
            <span className="text-[#c98d48] truncate max-w-[280px] sm:max-w-md">
              https://uegznkmvmaqstwvujfnx.supabase.co
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#352a21]">
            <span className="text-[#a89682]">Publishable API Key:</span>
            <span className="text-emerald-400 font-mono">
              sb_publishable_oxj4...PljEJO_x
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[#a89682]">Stored Appointments:</span>
            <span className="text-[#f5ebd7] font-semibold">
              {appointments.length} record{appointments.length !== 1 ? 's' : ''} in queue
            </span>
          </div>
        </div>

        {/* Connection Live Test */}
        <div className="bg-[#201915] border border-[#3e3227] rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#caa578]">
              Live Connection Status
            </span>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#2d231b] hover:bg-[#3d3025] text-xs text-[#e8dbcc] rounded-lg border border-[#4d3c2e] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testResult.hasAppointmentsTable
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : testResult.connected
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              {testResult.hasAppointmentsTable ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : testResult.connected ? (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-medium">{testResult.message}</p>
                {!testResult.hasAppointmentsTable && (
                  <p className="text-[11px] text-[#bdae9c]">
                    Appointments booked in the app are preserved locally and will automatically synchronize to your Supabase tables.
                    To display them in your Supabase Dashboard table viewer, run the quick SQL script below.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SQL Schema Script Helper */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-semibold text-[#f5ebd7] uppercase tracking-wider">
                Supabase SQL Table Schema
              </h4>
              <p className="text-[11px] text-[#9f8f7c]">
                Paste this into your Supabase Dashboard (SQL Editor) to create the <code className="text-[#e2c191]">appointments</code> table:
              </p>
            </div>
            <button
              onClick={handleCopySQL}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c98d48] hover:bg-[#d97736] text-[#14110e] font-semibold text-xs rounded-lg transition-colors shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="bg-[#120f0d] border border-[#3b2f24] rounded-xl p-3.5 text-[11px] font-mono text-[#d6c7b2] overflow-x-auto max-h-48 leading-relaxed">
              {SUPABASE_APPOINTMENTS_SQL}
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#352a21]">
          <a
            href="https://supabase.com/dashboard/project/uegznkmvmaqstwvujfnx/editor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#c98d48] hover:underline"
          >
            <span>Open Supabase SQL Editor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2d231b] hover:bg-[#3d3025] text-xs text-[#f5ebd7] rounded-lg border border-[#4d3c2e] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
