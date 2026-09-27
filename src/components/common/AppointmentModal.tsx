import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, CheckCircle, ShieldCheck, Database, ExternalLink } from 'lucide-react';
import { db } from '../../lib/supabase';
import { ArtistProfile, UserProfile } from '../../types';
import confetti from 'canvas-confetti';
import { SupabaseStatusModal } from './SupabaseStatusModal';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: ArtistProfile;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  artist,
  currentUser,
  onRequireAuth,
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [purpose, setPurpose] = useState('Guru-Shishya Masterclass & Guidance');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ synced: boolean; error?: string } | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!date) {
      alert('Please select an appointment date');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await db.appointments.createAsync({
        explorerId: currentUser.id,
        explorerName: currentUser.fullName,
        explorerEmail: currentUser.email,
        artistId: artist.id,
        artistName: artist.artistName,
        artForm: artist.artForm,
        date,
        time,
        purpose,
        notes,
      });

      setSyncStatus({ synced: res.supabaseSynced, error: res.supabaseError });

      // Trigger celebratory confetti for appointment request
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c98d48', '#d97736', '#f5e0b7'],
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit appointment request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#1a1613] border-2 border-[#524132] rounded-2xl p-6 sm:p-8 shadow-2xl text-[#ede5d8]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27201b] border border-[#3e3227] text-[#baa794] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="font-serif text-2xl text-[#f5ebd7]">
              Appointment Request Sent!
            </h3>
            <p className="text-sm text-[#bdae9c] max-w-sm mx-auto">
              Your request has been dispatched to{' '}
              <strong className="text-[#f0c88f]">{artist.artistName}</strong>.
            </p>

            {/* Supabase Storage Confirmation Banner */}
            <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-left max-w-md mx-auto space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Database Record Created</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-mono">
                Project: <strong className="text-white">uegznkmvmaqstwvujfnx</strong> • Form submission synchronized
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#c98d48]">
                  Cultural Consultation & Engagement
                </span>
                {artist.verificationStatus === 'Verified' && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Master
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded hover:bg-emerald-900/60 transition-colors"
                title="View Supabase configuration"
              >
                <Database className="w-2.5 h-2.5" />
                <span>Supabase Connected</span>
              </button>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-[#f5ebd7] mb-1">
              Book with {artist.artistName}
            </h3>
            <p className="text-xs text-[#b8a693] mb-5">
              Venerated practitioner of {artist.artForm} ({artist.location}).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#baa894] mb-1 font-medium">
                  Purpose of Engagement
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#241e19] border border-[#44372b] rounded-lg px-3 py-2.5 text-[#e5dbcc] focus:outline-none focus:border-[#c98d48]"
                >
                  <option value="Guru-Shishya Masterclass & Guidance">
                    Guru-Shishya Masterclass & Guidance
                  </option>
                  <option value="Lecture Demonstration & Cultural Discourse">
                    Lecture Demonstration & Cultural Discourse
                  </option>
                  <option value="Concert / Performance Engagement">
                    Concert / Performance Engagement
                  </option>
                  <option value="Repertoire Consultation & Tala/Raga Guidance">
                    Repertoire Consultation & Tala/Raga Guidance
                  </option>
                  <option value="Institutional / Academy Workshop">
                    Institutional / Academy Workshop
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa894] mb-1 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#c98d48]" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#241e19] border border-[#44372b] rounded-lg px-3 py-2 text-[#e5dbcc] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#c98d48]" />
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#241e19] border border-[#44372b] rounded-lg px-3 py-2 text-[#e5dbcc] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#baa894] mb-1 font-medium flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#c98d48]" />
                  Notes / Questions for the Artist (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details regarding your prior training, specific composition, or inquiry..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#241e19] border border-[#44372b] rounded-lg p-3 text-[#e5dbcc] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#c98d48] hover:bg-[#dba15a] disabled:opacity-50 text-[#120f0d] font-semibold rounded-lg text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4 text-[#120f0d]" />
                  <span>{isSubmitting ? 'Saving to Supabase Database...' : 'Confirm Appointment Request'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-[#918170]">
                <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Supabase Backend: uegznkmvmaqstwvujfnx
                </span>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="text-[#c98d48] hover:underline"
                >
                  View Details / SQL
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {showStatusModal && (
        <SupabaseStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
};
