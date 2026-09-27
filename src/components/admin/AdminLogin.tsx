import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  Database,
  Copy,
  Check,
  ArrowLeft,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { adminAuth, AdminSession } from '../../lib/adminAuth';

interface AdminLoginProps {
  onLoginSuccess: (session: AdminSession) => void;
  onBackToPublicSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToPublicSite,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedUserId, setUnauthorizedUserId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnauthorizedUserId(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminAuth.signIn(email, password);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setError(res.error || 'Authentication failed.');
        if (res.userId) {
          setUnauthorizedUserId(res.userId);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantTestAdmin = () => {
    const targetUserId = unauthorizedUserId || 'demo-admin-uuid-001';
    const targetEmail = email || 'admin@ganakalaloka.org';
    const session = adminAuth.grantAdminAccess(targetUserId, targetEmail);
    onLoginSuccess(session);
  };

  const sqlGrantSnippet = unauthorizedUserId
    ? `-- Run this in your Supabase SQL Editor:
INSERT INTO public.admin_users (user_id)
VALUES ('${unauthorizedUserId}')
ON CONFLICT (user_id) DO NOTHING;`
    : `-- Run this in your Supabase SQL Editor:
INSERT INTO public.admin_users (user_id)
VALUES ('<YOUR_SUPABASE_AUTH_USER_UUID>')
ON CONFLICT (user_id) DO NOTHING;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlGrantSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#110e0c] flex flex-col justify-center items-center p-4 text-[#ede5d8] font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c98d48]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Public Site Button */}
      <button
        onClick={onBackToPublicSite}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs text-[#a99785] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Public Website</span>
      </button>

      <div className="relative w-full max-w-md bg-[#181310] border-2 border-[#413326] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c98d48] to-[#7f4f1d] flex items-center justify-center mx-auto shadow-xl border border-[#f0c88f]/40 mb-3">
            <span className="font-serif text-2xl font-bold text-[#14110e]">ॐ</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#caa578]">
            Admin Control Center
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#f8ede0]">
            GanaKala Loka Admin
          </h2>
          <p className="text-xs text-[#9d8c7c]">
            Secure management console authenticated with Supabase
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <p className="font-medium leading-relaxed">{error}</p>

              {unauthorizedUserId && (
                <div className="pt-2 border-t border-rose-900/50 space-y-2">
                  <p className="text-[11px] text-[#dac1b2]">
                    To authorize this user, insert their UUID into your Supabase <code className="text-white">admin_users</code> table:
                  </p>
                  <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-rose-900/60 font-mono text-[10px]">
                    <span className="truncate">{unauthorizedUserId}</span>
                    <button
                      type="button"
                      onClick={copySql}
                      className="ml-2 text-rose-300 hover:text-white shrink-0"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[#baa794] font-medium mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c98d48]" />
              <span>Admin Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ganakalaloka.org"
              className="w-full bg-[#241c17] border border-[#44362a] rounded-xl px-3.5 py-2.5 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#baa794] font-medium mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#c98d48]" />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#241c17] border border-[#44362a] rounded-xl px-3.5 py-2.5 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48] transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c98d48] hover:bg-[#d89b56] disabled:opacity-50 text-[#120f0d] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating with Supabase...' : 'Sign In as Administrator'}</span>
            </button>
          </div>
        </form>

        {/* Fast-Track Testing & Demo Option */}
        <div className="pt-2 border-t border-[#31251e] space-y-3 text-center">
          <p className="text-[11px] text-[#938372]">
            Evaluating during hackathon demonstration or local test?
          </p>
          <button
            type="button"
            onClick={handleGrantTestAdmin}
            className="w-full py-2 px-3 bg-[#241d18] hover:bg-[#342921] border border-[#44362b] text-[#f2cb97] text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch Hackathon Demo Admin Session</span>
          </button>
        </div>

        {/* Supabase SQL Instructions Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="w-full flex items-center justify-between text-[11px] text-[#a49280] hover:text-[#f0c88f] transition-colors py-1"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Database className="w-3 h-3 text-[#c98d48]" />
              <span>Supabase admin_users SQL Info</span>
            </span>
            <span>{showSetupGuide ? 'Hide' : 'Show'}</span>
          </button>

          {showSetupGuide && (
            <div className="mt-2 p-3 bg-[#110e0c] border border-[#35291f] rounded-xl text-[11px] font-mono text-[#caa578] space-y-2">
              <p className="text-[#a4917e] text-[10px]">
                Target project: <strong className="text-white">uegznkmvmaqstwvujfnx</strong>
              </p>
              <pre className="text-[10px] overflow-x-auto text-[#e8dbcb] bg-[#1a1411] p-2 rounded border border-[#31241a] leading-relaxed">
{sqlGrantSnippet}
              </pre>
              <div className="flex justify-between items-center pt-1">
                <a
                  href="https://supabase.com/dashboard/project/uegznkmvmaqstwvujfnx/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#c98d48] hover:underline"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={copySql}
                  className="px-2 py-0.5 bg-[#292019] hover:bg-[#392d24] text-white rounded text-[10px]"
                >
                  {copiedSql ? 'Copied' : 'Copy SQL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
