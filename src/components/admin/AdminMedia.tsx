import React, { useState, useEffect } from 'react';
import {
  Film,
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Eye,
  X,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { MediaItem } from '../../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);

  const loadMedia = () => {
    setMediaList(db.media.getAll());
  };

  useEffect(() => {
    loadMedia();
    window.addEventListener('ganakala_data_changed', loadMedia);
    return () => window.removeEventListener('ganakala_data_changed', loadMedia);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video');
        const url = await db.media.uploadFile(file, 'culture-images');

        db.media.create({
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          type: isVideo ? 'video' : 'image',
          url,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          mimeType: file.type,
        });
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Failed to upload media'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = () => {
    if (!deletingMedia) return;
    db.media.delete(deletingMedia.id);
    if (previewMedia?.id === deletingMedia.id) {
      setPreviewMedia(null);
    }
    setDeletingMedia(null);
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.cultureName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            Media Assets & Storage Manager
          </h2>
          <p className="text-xs text-[#a99784]">
            Store, preview, copy URLs, and upload photography and recordings to Supabase storage
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2.5 bg-[#c98d48] hover:bg-[#d89b56] text-xs text-[#14110e] font-semibold rounded-xl shadow-md transition-all cursor-pointer active:scale-98 self-start sm:self-auto">
          <Upload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
          <span>{uploading ? 'Uploading to Supabase...' : 'Upload Media Asset'}</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d6c5d]" />
          <input
            type="text"
            placeholder="Search media by title or cultural tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b1512] border border-[#3b2e24] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2 bg-[#1b1512] border border-[#3b2e24] rounded-xl p-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'all'
                ? 'bg-[#2b211a] text-[#f2cb97] border border-[#4a392b]'
                : 'text-[#948373] hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('image')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'image'
                ? 'bg-[#2b211a] text-[#f2cb97] border border-[#4a392b]'
                : 'text-[#948373] hover:text-white'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setTypeFilter('video')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 'video'
                ? 'bg-[#2b211a] text-[#f2cb97] border border-[#4a392b]'
                : 'text-[#948373] hover:text-white'
            }`}
          >
            Videos
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#7d6c5d] bg-[#181310] border border-[#372b22] rounded-2xl">
            No media assets found. Upload images or video files to populate this gallery.
          </div>
        ) : (
          filteredMedia.map((media) => (
            <div
              key={media.id}
              className="bg-[#181310] border border-[#372b22] hover:border-[#c98d48]/50 rounded-2xl overflow-hidden shadow-lg group transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-black/50">
                {media.type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#15100d] text-[#c98d48]">
                    <Film className="w-8 h-8 opacity-80" />
                    <span className="text-[10px] font-mono mt-1 text-[#938271]">Video File</span>
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 justify-between">
                  <button
                    onClick={() => setPreviewMedia(media)}
                    className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    title="View Media"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => copyUrl(media.id, media.url)}
                    className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    title="Copy URL"
                  >
                    {copiedId === media.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeletingMedia(media)}
                    className="p-1.5 rounded-lg bg-rose-600/80 backdrop-blur-md text-white hover:bg-rose-600"
                    title="Delete Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <p className="font-medium text-[#f5ebd7] text-xs truncate" title={media.title}>
                  {media.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#7f6f60] font-mono">
                  <span>{media.size || 'Web Asset'}</span>
                  <span className="uppercase">{media.type}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181310] border border-[#3f3126] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs text-[#ede5d8]">
            <div className="flex items-center justify-between border-b border-[#30251c] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#f7ede0] truncate">
                {previewMedia.title}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 rounded-lg text-[#948373] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-[#33261d] flex items-center justify-center">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} controls className="w-full h-full" />
              ) : (
                <img
                  src={previewMedia.url}
                  alt=""
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[#a4917f] font-mono text-[11px] truncate max-w-md">
                {previewMedia.url}
              </span>
              <button
                onClick={() => copyUrl(previewMedia.id, previewMedia.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#251d17] hover:bg-[#342921] border border-[#443528] rounded-lg text-xs text-[#f2cb97]"
              >
                {copiedId === previewMedia.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === previewMedia.id ? 'Copied URL' : 'Copy Public URL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingMedia}
        title="Delete Media File"
        itemName={deletingMedia?.title || 'this media file'}
        warningMessage="This will permanently delete this media asset."
        onClose={() => setDeletingMedia(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
