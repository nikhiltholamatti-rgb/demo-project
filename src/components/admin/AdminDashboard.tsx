import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Palette,
  Image as ImageIcon,
  Calendar,
  Film,
  CalendarCheck,
  Clock,
  CheckCircle2,
  CheckCheck,
  XCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { Appointment, Culture } from '../../types';
import { AdminView } from './AdminLayout';

interface AdminDashboardProps {
  onNavigate: (view: AdminView, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cultures: 0,
    artists: 0,
    artworks: 0,
    events: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalMedia: 0,
  });

  const [recentBookings, setRecentBookings] = useState<Appointment[]>([]);
  const [recentCultures, setRecentCultures] = useState<Culture[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const counts = await db.stats.getDashboardStats();
      setStats(counts);
      setRecentBookings(db.appointments.getAll().slice(0, 5));
      setRecentCultures(db.cultures.getAll().slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('ganakala_data_changed', loadDashboardData);
    return () => window.removeEventListener('ganakala_data_changed', loadDashboardData);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#241c16] via-[#1a1411] to-[#16110f] border border-[#433527] p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c98d48] bg-[#2d2118] px-2.5 py-1 rounded-full border border-[#4d3a2b]">
              GanaKala Loka Admin System
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
              Cultural Archive & Bookings Overview
            </h2>
            <p className="text-xs text-[#a99784] max-w-xl">
              Real-time operational statistics directly queried from the Supabase database.
              Manage living traditions, artist engagements, and community appointments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2a201a] hover:bg-[#382b22] text-xs text-[#f5ebd7] rounded-xl border border-[#443529] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <button
              onClick={() => onNavigate('culture-new')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#c98d48] hover:bg-[#d89b56] text-xs text-[#14110e] font-semibold rounded-xl shadow-md transition-all active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Culture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg font-semibold text-[#f5ebd7]">
            Core Codex Statistics
          </h3>
          <span className="text-[11px] font-mono text-[#8f7e6e]">
            Live Supabase database counts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Total Cultures */}
          <div
            onClick={() => onNavigate('cultures')}
            className="p-4 rounded-2xl bg-[#181310] border border-[#3b2e24] hover:border-[#c98d48] transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a99786] font-medium">Total Cultures</span>
              <Landmark className="w-4 h-4 text-[#c98d48]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5ebd7] group-hover:text-[#f2cc96]">
              {stats.cultures}
            </p>
            <span className="text-[10px] text-[#786655] font-mono block">Traditions in codex</span>
          </div>

          {/* Total Artists */}
          <div
            onClick={() => onNavigate('artists')}
            className="p-4 rounded-2xl bg-[#181310] border border-[#3b2e24] hover:border-[#c98d48] transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a99786] font-medium">Total Artists</span>
              <Palette className="w-4 h-4 text-[#c98d48]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5ebd7] group-hover:text-[#f2cc96]">
              {stats.artists}
            </p>
            <span className="text-[10px] text-[#786655] font-mono block">Registered masters</span>
          </div>

          {/* Total Artworks */}
          <div
            onClick={() => onNavigate('artworks')}
            className="p-4 rounded-2xl bg-[#181310] border border-[#3b2e24] hover:border-[#c98d48] transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a99786] font-medium">Total Artworks</span>
              <ImageIcon className="w-4 h-4 text-[#c98d48]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5ebd7] group-hover:text-[#f2cc96]">
              {stats.artworks}
            </p>
            <span className="text-[10px] text-[#786655] font-mono block">Exhibits & artifacts</span>
          </div>

          {/* Total Events */}
          <div
            onClick={() => onNavigate('events')}
            className="p-4 rounded-2xl bg-[#181310] border border-[#3b2e24] hover:border-[#c98d48] transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a99786] font-medium">Total Events</span>
              <Calendar className="w-4 h-4 text-[#c98d48]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5ebd7] group-hover:text-[#f2cc96]">
              {stats.events}
            </p>
            <span className="text-[10px] text-[#786655] font-mono block">Scheduled performances</span>
          </div>

          {/* Total Media */}
          <div
            onClick={() => onNavigate('media')}
            className="p-4 rounded-2xl bg-[#181310] border border-[#3b2e24] hover:border-[#c98d48] transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a99786] font-medium">Total Media</span>
              <Film className="w-4 h-4 text-[#c98d48]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#f5ebd7] group-hover:text-[#f2cc96]">
              {stats.totalMedia}
            </p>
            <span className="text-[10px] text-[#786655] font-mono block">Images & videos</span>
          </div>
        </div>
      </div>

      {/* Booking Statistics Breakdown Card (Requirement 2 & 23) */}
      <div className="bg-[#181310] border border-[#3c2f24] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2d221a] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#c98d48]" />
              <h3 className="font-serif text-xl font-bold text-[#f5ebd7]">
                Appointment & Booking Metrics
              </h3>
            </div>
            <p className="text-xs text-[#a69482]">
              Live counts computed directly from the Supabase <code className="text-[#f0c88f]">appointments</code> table.
            </p>
          </div>

          <button
            onClick={() => onNavigate('bookings')}
            className="flex items-center gap-1.5 text-xs text-[#c98d48] hover:underline self-start sm:self-auto"
          >
            <span>Manage All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Specific Booking Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-sans">
          {/* Total Bookings */}
          <div className="p-4 rounded-2xl bg-[#221b16] border border-[#3f3126] space-y-1">
            <span className="text-[11px] text-[#a99887] uppercase tracking-wider font-mono">
              Total Bookings
            </span>
            <p className="font-serif text-3xl font-bold text-[#f5ebd7]">
              {stats.totalBookings}
            </p>
            <span className="text-[10px] text-[#7e6d5e]">Recorded submissions</span>
          </div>

          {/* Pending Bookings */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider font-mono">
                Pending
              </span>
            </div>
            <p className="font-serif text-3xl font-bold text-amber-200">
              {stats.pendingBookings}
            </p>
            <span className="text-[10px] text-amber-300/70">Awaiting confirmation</span>
          </div>

          {/* Confirmed Bookings */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider font-mono">
                Confirmed
              </span>
            </div>
            <p className="font-serif text-3xl font-bold text-emerald-200">
              {stats.confirmedBookings}
            </p>
            <span className="text-[10px] text-emerald-300/70">Scheduled sessions</span>
          </div>

          {/* Completed Bookings */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-300">
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider font-mono">
                Completed
              </span>
            </div>
            <p className="font-serif text-3xl font-bold text-blue-200">
              {stats.completedBookings}
            </p>
            <span className="text-[10px] text-blue-300/70">Concluded engagements</span>
          </div>

          {/* Cancelled Bookings */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-300">
              <XCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider font-mono">
                Cancelled
              </span>
            </div>
            <p className="font-serif text-3xl font-bold text-rose-200">
              {stats.cancelledBookings}
            </p>
            <span className="text-[10px] text-rose-300/70">Declined / cancelled</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections (Bookings & Cultures) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings List */}
        <div className="bg-[#181310] border border-[#3b2e24] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#f5ebd7]">
              Recent Booking Requests
            </h3>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs text-[#c98d48] hover:underline"
            >
              View all
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#201915] border border-[#34271e] text-[#867566] text-xs">
              No records available.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-[#211a15] border border-[#372b21] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#f5ebd7] truncate">
                      {b.explorerName}
                    </p>
                    <p className="text-[11px] text-[#baa794] truncate">
                      with <strong className="text-[#f0c88f]">{b.artistName}</strong> • {b.date}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                      b.status === 'Confirmed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : b.status === 'Completed'
                        ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                        : b.status === 'Cancelled'
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Culture Catalog Quick Access */}
        <div className="bg-[#181310] border border-[#3b2e24] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#f5ebd7]">
              Culture Codex Preview
            </h3>
            <button
              onClick={() => onNavigate('cultures')}
              className="text-xs text-[#c98d48] hover:underline"
            >
              Manage cultures
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentCultures.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('culture-edit', c.id)}
                className="p-3 rounded-xl bg-[#211a15] border border-[#372b21] hover:border-[#c98d48] transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src={c.imagePlate || c.bannerUrl}
                  alt={c.name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#483727] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-sm font-semibold text-[#f5ebd7] truncate group-hover:text-[#f0c88f]">
                    {c.name}
                  </h4>
                  <p className="text-[10px] text-[#a99887] truncate">{c.category}</p>
                  <span className="text-[9px] font-mono text-[#c98d48] block truncate">
                    {c.region}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
