import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  CheckCheck,
  XCircle,
  Trash2,
  RefreshCw,
  Clock,
  Mail,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { db, fetchAppointmentsFromSupabase } from '../../lib/supabase';
import { Appointment, AppointmentStatus } from '../../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Appointment | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // 1. Fetch remote Supabase appointments
      const remote = await fetchAppointmentsFromSupabase();
      if (remote.length > 0) {
        // Merge with local
        const local = db.appointments.getAll();
        const existingIds = new Set(local.map((a) => a.id));
        remote.forEach((r) => {
          if (!existingIds.has(r.id)) local.push(r);
        });
        localStorage.setItem('ganakala_appointments', JSON.stringify(local));
      }
      setBookings(db.appointments.getAll());
    } catch (e) {
      console.warn('Error loading bookings:', e);
      setBookings(db.appointments.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    window.addEventListener('ganakala_data_changed', loadBookings);
    return () => window.removeEventListener('ganakala_data_changed', loadBookings);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: AppointmentStatus) => {
    db.appointments.updateStatus(id, newStatus);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const handleDelete = () => {
    if (!deletingBooking) return;
    db.appointments.delete(deletingBooking.id);
    if (selectedBooking?.id === deletingBooking.id) {
      setSelectedBooking(null);
    }
    setDeletingBooking(null);
  };

  // Dynamic calculation from actual database records (Requirement 3 & 23)
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(
    (b) => b.status === 'Cancelled' || b.status === 'Declined'
  ).length;

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.explorerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.explorerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.artistName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Cancelled'
        ? b.status === 'Cancelled' || b.status === 'Declined'
        : b.status === statusFilter;

    const matchesDate = !dateFilter || b.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            Appointment & Booking Management
          </h2>
          <p className="text-xs text-[#a99784]">
            Review, verify, confirm, and update cultural appointments saved in Supabase
          </p>
        </div>

        <button
          onClick={loadBookings}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#251e18] hover:bg-[#342a22] text-xs text-[#f5ebd7] rounded-xl border border-[#443529] transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Top Booking Statistics Cards (Requirement 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-sans">
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-[#292019] border-[#c98d48]'
              : 'bg-[#181310] border-[#382b21] hover:border-[#523f30]'
          }`}
        >
          <span className="text-[10px] text-[#a99887] uppercase font-mono block">Total</span>
          <p className="font-serif text-2xl font-bold text-[#f5ebd7]">{totalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('Pending')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-amber-950/40 border-amber-500'
              : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
          }`}
        >
          <span className="text-[10px] text-amber-300 uppercase font-mono block">Pending</span>
          <p className="font-serif text-2xl font-bold text-amber-200">{pendingCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('Confirmed')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Confirmed'
              ? 'bg-emerald-950/40 border-emerald-500'
              : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
          }`}
        >
          <span className="text-[10px] text-emerald-300 uppercase font-mono block">Confirmed</span>
          <p className="font-serif text-2xl font-bold text-emerald-200">{confirmedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Completed'
              ? 'bg-blue-950/40 border-blue-500'
              : 'bg-blue-950/20 border-blue-500/30 hover:border-blue-500/50'
          }`}
        >
          <span className="text-[10px] text-blue-300 uppercase font-mono block">Completed</span>
          <p className="font-serif text-2xl font-bold text-blue-200">{completedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('Cancelled')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Cancelled'
              ? 'bg-rose-950/40 border-rose-500'
              : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
          }`}
        >
          <span className="text-[10px] text-rose-300 uppercase font-mono block">Cancelled</span>
          <p className="font-serif text-2xl font-bold text-rose-200">{cancelledCount}</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-[#181310] border border-[#3c2f24] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7a69]" />
          <input
            type="text"
            placeholder="Search by Explorer name, email, artist, purpose, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#221b16] border border-[#3e3025] rounded-xl text-xs text-[#f5ebd7] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#c98d48] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#221b16] border border-[#3e3025] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48] w-full md:w-auto"
          >
            <option value="All">All Statuses ({totalCount})</option>
            <option value="Pending">Pending ({pendingCount})</option>
            <option value="Confirmed">Confirmed ({confirmedCount})</option>
            <option value="Completed">Completed ({completedCount})</option>
            <option value="Cancelled">Cancelled ({cancelledCount})</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-[#c98d48] shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#221b16] border border-[#3e3025] rounded-xl px-3 py-1.5 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48] w-full md:w-auto"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-[#a99786] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#181310] border border-[#3c2f24] rounded-3xl shadow-xl overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8c7b6c] space-y-2">
            <CalendarCheck className="w-10 h-10 mx-auto text-[#4d3a2b]" />
            <p className="font-serif text-lg text-[#ccc]">No records available.</p>
            <p className="text-[11px] text-[#777]">
              {searchTerm || statusFilter !== 'All' || dateFilter
                ? 'No bookings match your current filter criteria.'
                : 'No appointments have been booked yet. Submit a booking from the public website to see it appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-[#221b16] border-b border-[#3b2e24] text-[11px] font-mono uppercase tracking-wider text-[#a99786]">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Explorer</th>
                  <th className="py-3 px-4">Artist & Art Form</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2018]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#201914] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[10px] text-[#a99887] max-w-[100px] truncate" title={b.id}>
                      {b.id.replace('appt-', '')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#f5ebd7]">{b.explorerName}</div>
                      <div className="text-[11px] text-[#8e7e6e] truncate max-w-[150px]">{b.explorerEmail || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#f0c88f]">{b.artistName}</div>
                      <div className="text-[11px] text-[#a99786]">{b.artForm}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-[#f5ebd7] font-medium">{b.date}</div>
                      <div className="text-[11px] text-[#8e7e6e]">{b.time}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px] truncate text-[#d8c8b6]" title={b.purpose}>
                      {b.purpose}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : b.status === 'Completed'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                            : b.status === 'Cancelled' || b.status === 'Declined'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-950 text-amber-200 border border-amber-500/40'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg bg-[#2b221a] hover:bg-[#3d3025] text-[#e8dbcc] border border-[#44362b] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {b.status !== 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 transition-colors"
                            title="Confirm Booking"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {b.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Completed')}
                            className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-500/40 transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 transition-colors"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeletingBooking(b)}
                          className="p-1.5 rounded-lg bg-[#271d1a] hover:bg-rose-900/40 text-[#a98f82] hover:text-rose-300 border border-[#412e28] transition-colors"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#1a1512] border-2 border-[#4a392b] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#ede5d8] space-y-5">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27201b] border border-[#3e3227] text-[#baa794] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c98d48]">
                  Appointment Dossier
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    selectedBooking.status === 'Confirmed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : selectedBooking.status === 'Completed'
                      ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                      : selectedBooking.status === 'Cancelled'
                      ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#f7ede0]">
                {selectedBooking.purpose}
              </h3>
            </div>

            <div className="bg-[#231b16] border border-[#3b2d22] rounded-2xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#31251c]">
                <div>
                  <span className="text-[#8e7e6e] block text-[10px] uppercase font-mono">Explorer</span>
                  <p className="font-semibold text-[#f5ebd7]">{selectedBooking.explorerName}</p>
                  <p className="text-[#baa794] text-[11px] truncate">{selectedBooking.explorerEmail || 'No email provided'}</p>
                </div>
                <div>
                  <span className="text-[#8e7e6e] block text-[10px] uppercase font-mono">Artist Master</span>
                  <p className="font-semibold text-[#f0c88f]">{selectedBooking.artistName}</p>
                  <p className="text-[#baa794] text-[11px]">{selectedBooking.artForm}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#31251c]">
                <div>
                  <span className="text-[#8e7e6e] block text-[10px] uppercase font-mono">Scheduled Date</span>
                  <p className="font-semibold text-[#f5ebd7]">{selectedBooking.date}</p>
                </div>
                <div>
                  <span className="text-[#8e7e6e] block text-[10px] uppercase font-mono">Scheduled Time</span>
                  <p className="font-semibold text-[#f5ebd7]">{selectedBooking.time}</p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <span className="text-[#8e7e6e] block text-[10px] uppercase font-mono mb-1">Explorer Notes</span>
                  <p className="text-[#dacbbe] italic bg-[#1a1411] p-3 rounded-lg border border-[#32261e]">
                    "{selectedBooking.notes}"
                  </p>
                </div>
              )}

              <div className="pt-1 text-[10px] font-mono text-[#776657]">
                ID: {selectedBooking.id} • Created: {new Date(selectedBooking.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Status Change Controls */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-[#a99786] uppercase block">
                Update Status
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'Pending')}
                  className={`py-2 text-xs rounded-xl border font-medium transition-all ${
                    selectedBooking.status === 'Pending'
                      ? 'bg-amber-950 text-amber-200 border-amber-500 font-bold'
                      : 'bg-[#221b16] text-[#bdae9e] border-[#3e3025] hover:border-amber-500/50'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'Confirmed')}
                  className={`py-2 text-xs rounded-xl border font-medium transition-all ${
                    selectedBooking.status === 'Confirmed'
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-500 font-bold'
                      : 'bg-[#221b16] text-[#bdae9e] border-[#3e3025] hover:border-emerald-500/50'
                  }`}
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'Completed')}
                  className={`py-2 text-xs rounded-xl border font-medium transition-all ${
                    selectedBooking.status === 'Completed'
                      ? 'bg-blue-950 text-blue-200 border-blue-500 font-bold'
                      : 'bg-[#221b16] text-[#bdae9e] border-[#3e3025] hover:border-blue-500/50'
                  }`}
                >
                  Complete
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'Cancelled')}
                  className={`py-2 text-xs rounded-xl border font-medium transition-all ${
                    selectedBooking.status === 'Cancelled'
                      ? 'bg-rose-950 text-rose-200 border-rose-500 font-bold'
                      : 'bg-[#221b16] text-[#bdae9e] border-[#3e3025] hover:border-rose-500/50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 bg-[#2d231b] hover:bg-[#3d3025] text-xs text-[#f5ebd7] rounded-xl border border-[#4d3c2e] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBooking && (
        <DeleteConfirmModal
          isOpen={!!deletingBooking}
          itemType="Booking"
          itemName={`${deletingBooking.explorerName} with ${deletingBooking.artistName} (${deletingBooking.date})`}
          warningNote="Deleting this appointment permanently removes it from Supabase and the Explorer's records."
          onConfirm={handleDelete}
          onCancel={() => setDeletingBooking(null)}
        />
      )}
    </div>
  );
};
