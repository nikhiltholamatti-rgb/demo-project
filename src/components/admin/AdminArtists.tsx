import React, { useState, useEffect } from 'react';
import {
  Palette,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  ExternalLink,
  ShieldCheck,
  User,
  MapPin,
  Briefcase,
  X,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { ArtistProfile, VerificationStatus } from '../../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const AdminArtists: React.FC = () => {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [deletingArtist, setDeletingArtist] = useState<ArtistProfile | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const loadArtists = () => {
    setArtists(db.artists.getAll());
  };

  useEffect(() => {
    loadArtists();
    window.addEventListener('ganakala_data_changed', loadArtists);
    return () => window.removeEventListener('ganakala_data_changed', loadArtists);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: VerificationStatus) => {
    const updated = db.artists.update(id, {
      verificationStatus: newStatus,
      verificationNotes: editNotes || undefined,
    });
    if (selectedArtist && selectedArtist.id === id) {
      setSelectedArtist(updated);
    }
  };

  const handleDelete = () => {
    if (!deletingArtist) return;
    db.artists.delete(deletingArtist.id);
    if (selectedArtist?.id === deletingArtist.id) {
      setSelectedArtist(null);
    }
    setDeletingArtist(null);
  };

  const filteredArtists = artists.filter((a) => {
    const matchesSearch =
      a.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artForm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.bio || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : a.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'Under Review':
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Review Needed</span>
          </span>
        );
      case 'Requires Resubmission':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Resubmission</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            Artist Master Registry
          </h2>
          <p className="text-xs text-[#a99784]">
            Review artist credential portfolios, verify master practitioners, and oversee artist profiles
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#c98d48] bg-[#221b16] px-3 py-1.5 rounded-xl border border-[#443528]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{artists.filter((a) => a.verificationStatus === 'Verified').length} Verified / {artists.length} Total</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d6c5d]" />
          <input
            type="text"
            placeholder="Search artists by name, art form, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b1512] border border-[#3b2e24] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
          />
        </div>

        <div className="sm:col-span-4 relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d6c5d]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#1b1512] border border-[#3b2e24] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48] appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Requires Resubmission">Requires Resubmission</option>
            <option value="Verification Failed">Verification Failed</option>
          </select>
        </div>
      </div>

      {/* Artists Table */}
      <div className="bg-[#181310] border border-[#372b22] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#201814] text-[#baa794] border-b border-[#372b22] uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Artist</th>
                <th className="py-3.5 px-4 font-semibold">Art Form</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Experience</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2019]">
              {filteredArtists.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7d6c5d]">
                    No artists match the selected query.
                  </td>
                </tr>
              ) : (
                filteredArtists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-[#201915]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2a2019] border border-[#443528] flex items-center justify-center overflow-hidden shrink-0">
                          {artist.portfolioUrl && artist.portfolioUrl.startsWith('http') ? (
                            <img src={artist.portfolioUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Palette className="w-4 h-4 text-[#c98d48]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#f5ebd7]">{artist.artistName}</p>
                          <p className="text-[11px] text-[#938271] font-mono">{artist.traditionType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#e0d2c0]">{artist.artForm}</td>
                    <td className="py-3 px-4 text-[#baa794]">{artist.location}</td>
                    <td className="py-3 px-4 font-mono text-[#c98d48]">
                      {artist.yearsExperience} yrs
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(artist.verificationStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedArtist(artist);
                            setEditNotes(artist.verificationNotes || '');
                          }}
                          className="p-1.5 rounded-lg bg-[#271e19] hover:bg-[#382b22] text-[#e0cfbb] transition-colors"
                          title="Review & Verify Artist"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingArtist(artist)}
                          className="p-1.5 rounded-lg bg-[#2b1816] hover:bg-[#3d1f1c] text-rose-300 transition-colors"
                          title="Delete Artist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Verification Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181310] border border-[#3f3126] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-xs text-[#ede5d8]">
            <div className="flex items-start justify-between border-b border-[#30251c] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c98d48]">
                  Artist Verification Review
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#f7ede0] mt-0.5">
                  {selectedArtist.artistName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArtist(null)}
                className="p-1 rounded-lg text-[#948373] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-[#201814] p-3.5 rounded-xl border border-[#34271e]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#948373]">Art Form</span>
                  <p className="font-semibold text-white mt-0.5">{selectedArtist.artForm}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#948373]">Location</span>
                  <p className="font-semibold text-white mt-0.5">{selectedArtist.location}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#948373]">Experience</span>
                  <p className="font-semibold text-[#c98d48] mt-0.5">{selectedArtist.yearsExperience} Years</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#948373]">Tradition</span>
                  <p className="font-semibold text-white mt-0.5">{selectedArtist.traditionType}</p>
                </div>
              </div>

              <div>
                <label className="block text-[#a99786] font-medium mb-1 font-mono text-[11px]">
                  Bio & Guru Parampara
                </label>
                <p className="bg-[#201814] p-3 rounded-xl border border-[#34271e] text-[#d6c7b5] leading-relaxed">
                  {selectedArtist.bio || 'No biography submitted.'}
                </p>
              </div>

              {selectedArtist.documentUrl && (
                <div>
                  <label className="block text-[#a99786] font-medium mb-1 font-mono text-[11px]">
                    Credentials Document / Certificate
                  </label>
                  <a
                    href={selectedArtist.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#c98d48] hover:underline bg-[#201814] px-3 py-1.5 rounded-lg border border-[#382b21]"
                  >
                    <span>View Submitted Credentials</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div>
                <label className="block text-[#a99786] font-medium mb-1 font-mono text-[11px]">
                  Admin Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Verified through Sangeet Natak Akademi archives or Kalamandalam alumni record."
                  className="w-full bg-[#201814] border border-[#34271e] rounded-xl p-2.5 text-xs text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              {/* Status Update Buttons */}
              <div className="pt-2 border-t border-[#30251c] space-y-2">
                <span className="text-[11px] font-mono text-[#a99786] block">
                  Change Verification Status:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedArtist.id, 'Verified')}
                    className="py-2 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-medium text-xs text-center transition-all"
                  >
                    Mark Verified
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedArtist.id, 'Under Review')}
                    className="py-2 px-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded-xl font-medium text-xs text-center transition-all"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedArtist.id, 'Requires Resubmission')}
                    className="py-2 px-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 rounded-xl font-medium text-xs text-center transition-all"
                  >
                    Resubmission
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedArtist.id, 'Verification Failed')}
                    className="py-2 px-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-xl font-medium text-xs text-center transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingArtist}
        title="Delete Artist Profile"
        itemName={deletingArtist?.artistName || 'this artist'}
        warningMessage="This will permanently delete this artist profile from GanaKala Loka and Supabase."
        onClose={() => setDeletingArtist(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
