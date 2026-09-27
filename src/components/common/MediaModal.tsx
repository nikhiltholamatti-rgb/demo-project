import React from 'react';
import { X, Heart, Bookmark, Share2, Play, User } from 'lucide-react';
import { Video, Artwork, UserProfile } from '../../types';
import { db } from '../../lib/supabase';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  video?: Video | null;
  artwork?: Artwork | null;
  currentUser: UserProfile | null;
  onSelectArtist?: (artistId: string) => void;
  onRequireAuth?: () => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  video,
  artwork,
  currentUser,
  onSelectArtist,
  onRequireAuth,
}) => {
  if (!isOpen || (!video && !artwork)) return null;

  const item = video || artwork!;
  const isVideo = !!video;

  const handleLike = () => {
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    db.likes.toggle(currentUser.id, item.id, isVideo ? 'video' : 'artwork');
  };

  const handleSave = () => {
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    db.saves.toggle(currentUser.id, {
      targetId: item.id,
      targetType: isVideo ? 'video' : 'artwork',
      title: item.title,
      subtitle: `${item.artistName} • ${item.cultureName}`,
      imageUrl: isVideo ? (item as Video).thumbnailUrl : (item as Artwork).mediaUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#171310] border-2 border-[#4c3c2e] rounded-3xl p-4 sm:p-6 shadow-2xl text-[#ede5d8] my-8 flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 border border-[#3e3227] text-[#baa794] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Frame */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#3b2e23] mb-4">
          {isVideo ? (
            <video
              src={(item as Video).videoUrl}
              poster={(item as Video).thumbnailUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={(item as Artwork).mediaUrl}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Media Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#31251c]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c98d48] bg-[#292019] px-2 py-0.5 rounded border border-[#483728]">
                {item.cultureName}
              </span>
              {isVideo && (
                <span className="text-[10px] font-mono text-[#8e7e6e]">
                  Duration: {(item as Video).duration}
                </span>
              )}
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#f6eedf]">
              {item.title}
            </h3>
            <p
              onClick={() => {
                onSelectArtist?.(item.artistId);
                onClose();
              }}
              className="text-xs text-[#caa578] hover:underline cursor-pointer mt-0.5 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Created by {item.artistName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="p-2.5 rounded-xl bg-[#241d17] border border-[#443527] text-[#baa794] hover:text-rose-400 transition-all"
              title="Like"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2.5 rounded-xl bg-[#241d17] border border-[#443527] text-[#baa794] hover:text-[#c98d48] transition-all"
              title="Save"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-4 overflow-y-auto">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#998776] mb-1">
            Archival Description & Heritage Context
          </h4>
          <p className="text-sm text-[#ded3c3] leading-relaxed font-body">
            {item.description}
          </p>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-sans bg-[#201915] text-[#bdae9c] border border-[#3b2f24] px-2.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
