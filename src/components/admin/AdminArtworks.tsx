import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Heart,
  MessageSquare,
  Eye,
  X,
  Palette,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { Artwork } from '../../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const AdminArtworks: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cultureFilter, setCultureFilter] = useState('All');
  const [previewArtwork, setPreviewArtwork] = useState<Artwork | null>(null);
  const [deletingArtwork, setDeletingArtwork] = useState<Artwork | null>(null);

  const loadArtworks = () => {
    setArtworks(db.artworks.getAll());
  };

  useEffect(() => {
    loadArtworks();
    window.addEventListener('ganakala_data_changed', loadArtworks);
    return () => window.removeEventListener('ganakala_data_changed', loadArtworks);
  }, []);

  const handleDelete = () => {
    if (!deletingArtwork) return;
    db.artworks.delete(deletingArtwork.id);
    if (previewArtwork?.id === deletingArtwork.id) {
      setPreviewArtwork(null);
    }
    setDeletingArtwork(null);
  };

  const cultureOptions = ['All', ...Array.from(new Set(artworks.map((a) => a.cultureName).filter(Boolean)))];

  const filteredArtworks = artworks.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCulture =
      cultureFilter === 'All' ? true : a.cultureName === cultureFilter;

    return matchesSearch && matchesCulture;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            Artworks & Artifacts Archive
          </h2>
          <p className="text-xs text-[#a99784]">
            Moderate, review, and curate master visual works, costume studies, and sculpture plates
          </p>
        </div>

        <div className="text-xs font-mono text-[#c98d48] bg-[#221b16] px-3 py-1.5 rounded-xl border border-[#443528]">
          Total Artworks: {artworks.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d6c5d]" />
          <input
            type="text"
            placeholder="Search artworks by title, artist, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b1512] border border-[#3b2e24] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
          />
        </div>

        <div className="sm:col-span-4 relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d6c5d]" />
          <select
            value={cultureFilter}
            onChange={(e) => setCultureFilter(e.target.value)}
            className="w-full bg-[#1b1512] border border-[#3b2e24] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48] cursor-pointer"
          >
            {cultureOptions.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Cultural Traditions' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredArtworks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#7d6c5d] bg-[#181310] border border-[#372b22] rounded-2xl">
            No artworks match the selected criteria.
          </div>
        ) : (
          filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className="bg-[#181310] border border-[#372b22] hover:border-[#c98d48]/50 rounded-2xl overflow-hidden shadow-lg group transition-all flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-black/40">
                <img
                  src={artwork.mediaUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-between">
                  <button
                    onClick={() => setPreviewArtwork(artwork)}
                    className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    title="Preview Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingArtwork(artwork)}
                    className="p-1.5 rounded-lg bg-rose-600/80 backdrop-blur-md text-white hover:bg-rose-600"
                    title="Delete Artwork"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-mono text-[#c98d48] uppercase tracking-wider block">
                    {artwork.cultureName}
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#f5ebd7] truncate" title={artwork.title}>
                    {artwork.title}
                  </h4>
                  <p className="text-[11px] text-[#a99786] truncate">
                    by {artwork.artistName}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#292019] text-[10px] text-[#847363]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      {artwork.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {artwork.commentsCount}
                    </span>
                  </div>
                  <span className="font-mono text-[#6e5d4e]">
                    {artwork.location || 'India'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181310] border border-[#3f3126] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs text-[#ede5d8]">
            <div className="flex items-center justify-between border-b border-[#30251c] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#f7ede0]">
                {previewArtwork.title}
              </h3>
              <button
                onClick={() => setPreviewArtwork(null)}
                className="p-1 rounded-lg text-[#948373] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-[#33261d]">
              <img
                src={previewArtwork.mediaUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[#baa794] leading-relaxed">
                {previewArtwork.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {previewArtwork.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-[#251d17] border border-[#3e3025] text-[#c98d48] text-[10px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingArtwork}
        title="Delete Artwork"
        itemName={deletingArtwork?.title || 'this artwork'}
        warningMessage="This will permanently delete this artwork from the gallery and remove it from Supabase."
        onClose={() => setDeletingArtwork(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
