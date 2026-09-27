import React, { useState, useEffect } from 'react';
import {
  Database,
  Shield,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Server,
  Layers,
} from 'lucide-react';
import { supabase, SUPABASE_CONFIG, testSupabaseConnection, db } from '../../lib/supabase';

export const AdminSettings: React.FC = () => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    hasAppointmentsTable: boolean;
    message: string;
  } | null>(null);

  const [adminUuids, setAdminUuids] = useState<string[]>([]);
  const [newUuid, setNewUuid] = useState('');
  const [addingUuid, setAddingUuid] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadAdminUsers = async () => {
    // 1. Load from local authorized cache
    const cached: string[] = JSON.parse(
      localStorage.getItem('ganakala_admin_users_cache') || '[]'
    );
    setAdminUuids(cached);

    // 2. Fetch from Supabase admin_users table
    try {
      const { data, error } = await supabase.from('admin_users').select('user_id');
      if (!error && Array.isArray(data)) {
        const remoteIds = data.map((d: any) => d.user_id).filter(Boolean);
        const merged = Array.from(new Set([...cached, ...remoteIds]));
        setAdminUuids(merged);
        localStorage.setItem('ganakala_admin_users_cache', JSON.stringify(merged));
      }
    } catch {
      // Local fallback intact
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        connected: false,
        hasAppointmentsTable: false,
        message: err?.message || 'Failed to ping Supabase.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleAddAdminUuid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUuid.trim()) return;

    setAddingUuid(true);
    const targetUuid = newUuid.trim();

    // 1. Add to local cache
    const updated = Array.from(new Set([...adminUuids, targetUuid]));
    setAdminUuids(updated);
    localStorage.setItem('ganakala_admin_users_cache', JSON.stringify(updated));

    // 2. Attempt insert to Supabase admin_users
    try {
      await supabase.from('admin_users').insert([{ user_id: targetUuid }]);
    } catch (err) {
      console.warn('Note: inserting into Supabase admin_users:', err);
    }

    setNewUuid('');
    setAddingUuid(false);
  };

  const handleRemoveAdminUuid = (uuidToRemove: string) => {
    const updated = adminUuids.filter((id) => id !== uuidToRemove);
    setAdminUuids(updated);
    localStorage.setItem('ganakala_admin_users_cache', JSON.stringify(updated));

    supabase.from('admin_users').delete().eq('user_id', uuidToRemove).then(() => {});
  };

  const adminUsersSql = `-- ===================================================
-- GanaKala Loka: Supabase admin_users table & policies
-- Run this in your Supabase SQL Editor (Project: uegznkmvmaqstwvujfnx)
-- ===================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to check their own admin status
CREATE POLICY "Allow users to read admin_users" ON public.admin_users
    FOR SELECT TO anon, authenticated USING (true);

-- To authorize your Supabase account as an Admin:
-- Replace <YOUR_AUTH_USER_UUID> with your authenticated User UUID
-- INSERT INTO public.admin_users (user_id) VALUES ('<YOUR_AUTH_USER_UUID>');
`;

  const copySql = () => {
    navigator.clipboard.writeText(adminUsersSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
          Admin Panel Settings & Database Sync
        </h2>
        <p className="text-xs text-[#a99784]">
          Manage connected Supabase backend credentials, verify tables, and authorize admin accounts
        </p>
      </div>

      {/* Supabase Connection Overview */}
      <div className="bg-[#181310] border border-[#3b2d23] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30251c] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#f7ede0]">
                Connected Supabase Backend
              </h3>
              <p className="text-xs text-[#a99784] font-mono">
                Project ID: {SUPABASE_CONFIG.projectId}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="flex items-center gap-2 px-4 py-2 bg-[#251d17] hover:bg-[#342921] border border-[#443528] rounded-xl text-xs text-[#f2cb97] font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'Testing Connection...' : 'Test Supabase Health'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#201814] p-4 rounded-xl border border-[#34271e] space-y-1">
            <span className="text-[#847363] text-[10px] uppercase">Project ID</span>
            <p className="text-white font-semibold">{SUPABASE_CONFIG.projectId}</p>
          </div>
          <div className="bg-[#201814] p-4 rounded-xl border border-[#34271e] space-y-1">
            <span className="text-[#847363] text-[10px] uppercase">API URL</span>
            <p className="text-white font-semibold truncate">{SUPABASE_CONFIG.url}</p>
          </div>
          <div className="bg-[#201814] p-4 rounded-xl border border-[#34271e] space-y-1">
            <span className="text-[#847363] text-[10px] uppercase">API Key Status</span>
            <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Publishable Key Active</span>
            </p>
          </div>
        </div>

        {/* Live Test Results Alert */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 ${
              testResult.connected
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {testResult.connected ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>
                {testResult.connected
                  ? 'Supabase Connection Verified & Operational'
                  : 'Supabase REST Endpoint Warning'}
              </span>
            </div>
            <p className="text-[11px] font-mono opacity-90">{testResult.message}</p>
            <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono">
              <span
                className={`px-2.5 py-1 rounded-md border ${
                  testResult.connected
                    ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-900/30 border-rose-500/30 text-rose-300'
                }`}
              >
                Project: {SUPABASE_CONFIG.projectId}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md border ${
                  testResult.hasAppointmentsTable
                    ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-900/30 border-amber-500/30 text-amber-300'
                }`}
              >
                Appointments Table: {testResult.hasAppointmentsTable ? '✓ Verified in Supabase' : 'Waiting for SQL Schema'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Admin Users UUID Access Control (Requirement 1) */}
      <div className="bg-[#181310] border border-[#3b2d23] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-[#30251c] pb-4">
          <div className="flex items-center gap-2 text-[#c98d48] text-xs font-mono uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Requirement 1 · Access Control</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#f7ede0]">
            Authorized Admin UUIDs (admin_users)
          </h3>
          <p className="text-xs text-[#a99784] mt-1">
            Only users with their authenticated account UUID registered in the <code>admin_users</code> table
            are granted access to this Admin Panel.
          </p>
        </div>

        {/* Add UUID Form */}
        <form onSubmit={handleAddAdminUuid} className="flex gap-2">
          <input
            type="text"
            required
            value={newUuid}
            onChange={(e) => setNewUuid(e.target.value)}
            placeholder="Enter User UUID (e.g. 8f6b1580-c0a7-4951-b0e2-6d2c499c89e2)"
            className="flex-1 bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2.5 text-xs text-[#ede5d8] placeholder-[#7d6c5d] font-mono focus:outline-none focus:border-[#c98d48]"
          />
          <button
            type="submit"
            disabled={addingUuid}
            className="px-4 py-2.5 bg-[#c98d48] hover:bg-[#d89b56] text-[#14110e] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Authorize UUID</span>
          </button>
        </form>

        {/* UUIDs List */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#847363] uppercase">
            Active Authorized Admin UUIDs ({adminUuids.length}):
          </span>
          <div className="divide-y divide-[#281e17] bg-[#201814] border border-[#34271e] rounded-xl overflow-hidden">
            {adminUuids.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#7d6c5d]">
                No admin UUIDs configured yet.
              </div>
            ) : (
              adminUuids.map((id) => (
                <div key={id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono text-[#e0d2c0]">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{id}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAdminUuid(id)}
                    className="p-1 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Remove Admin UUID"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SQL Script for Supabase admin_users */}
        <div className="space-y-2 pt-2 border-t border-[#30251c]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#caa578]">
              Supabase SQL for admin_users Table:
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard/project/uegznkmvmaqstwvujfnx/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-[#c98d48] hover:underline"
              >
                <span>Supabase SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={copySql}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#251d17] hover:bg-[#342921] border border-[#443528] rounded-lg text-xs text-[#f2cb97]"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
          </div>
          <pre className="text-[11px] font-mono text-[#caa578] bg-[#14100e] border border-[#30251c] p-3 rounded-xl overflow-x-auto leading-relaxed">
            {adminUsersSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
