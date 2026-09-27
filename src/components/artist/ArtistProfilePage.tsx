import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Heart,
  Bookmark,
  Share2,
  Award,
  Play,
  Image as ImageIcon,
  MessageSquare,
  Globe,
  MapPin,
  Clock,
  Send,
  Trash2,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import {
  ArtistProfile,
  Artwork,
  Video,
  Achievement,
  Post,
  Comment,
  UserProfile,
} from '../../types';
import { Card3D } from '../common/Card3D';

interface ArtistProfilePageProps {
  artistId: string;
  currentUser: UserProfile | null;
  onBack: () => void;
  onBookAppointment: (artist: ArtistProfile) => void;
  onPlayVideo: (video: Video) => void;
  onViewArtwork: (artwork: Artwork) => void;
  onRequireAuth: () => void;
  onShare: (title: string, text: string) => void;
}

export const ArtistProfilePage: React.FC<ArtistProfilePageProps> = ({
  artistId,
  currentUser,
  onBack,
  onBookAppointment,
  onPlayVideo,
  onViewArtwork,
  onRequireAuth,
  onShare,
}) => {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'works' | 'videos' | 'awards' | 'posts'>(
    'videos'
  );
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const loadData = () => {
    const loadedArtist = db.artists.getById(artistId);
    if (loadedArtist) {
      setArtist(loadedArtist);
      setArtworks(db.artworks.getByArtist(artistId));
      setVideos(db.videos.getByArtist(artistId));
      setAchievements(db.achievements.getByArtist(artistId));
      setPosts(db.posts.getByArtist(artistId));
      setComments(db.comments.getForTarget(artistId));
      setLikesCount(db.likes.getCount(artistId));

      if (currentUser) {
        setIsLiked(db.likes.hasLiked(currentUser.id, artistId));
        setIsSaved(db.saves.hasSaved(currentUser.id, artistId));
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ganakala_data_changed', loadData);
    return () => window.removeEventListener('ganakala_data_changed', loadData);
  }, [artistId, currentUser]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#120f0e] flex items-center justify-center p-6 text-center text-[#ddd]">
        <div>
          <h2 className="font-serif text-3xl mb-2">Artist Profile Not Found</h2>
          <p className="text-xs text-[#888] mb-4">
            The requested practitioner profile is not present in the current registry.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#c98d48] text-black font-semibold rounded-lg text-xs"
          >
            Return to Explorations
          </button>
        </div>
      </div>
    );
  }

  const handleToggleLike = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const newLiked = db.likes.toggle(currentUser.id, artist.id, 'artist');
    setIsLiked(newLiked);
    setLikesCount(db.likes.getCount(artist.id));
  };

  const handleToggleSave = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const newSaved = db.saves.toggle(currentUser.id, {
      targetId: artist.id,
      targetType: 'artist',
      title: artist.artistName,
      subtitle: `${artist.artForm} • ${artist.location}`,
      imageUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });
    setIsSaved(newSaved);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!newComment.trim()) return;

    db.comments.create({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
      targetId: artist.id,
      targetType: 'artist',
      text: newComment.trim(),
    });

    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) return;
    db.comments.delete(commentId, currentUser.id);
  };

  return (
    <div className="min-h-screen bg-[#120f0e] text-[#ede6d8] pb-24 font-body">
      {/* Header bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#221c17] hover:bg-[#2e261f] border border-[#3e3227] text-xs font-sans text-[#f2e7d7] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#c98d48]" />
          <span>Back to Artists</span>
        </button>
      </div>

      {/* Artist Profile Header Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
        <div className="bg-[#171310] border-2 border-[#47382b] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#2e2319] border-2 border-[#c98d48] flex items-center justify-center font-serif text-4xl text-[#f0c88f] shadow-xl overflow-hidden">
                  {artist.artistName[0]}
                </div>
                {artist.verificationStatus === 'Verified' && (
                  <div
                    className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1.5 shadow-lg border-2 border-[#171310]"
                    title="Verified Cultural Master"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl text-[#f7eee1]">
                    {artist.artistName}
                  </h1>
                  {artist.verificationStatus === 'Verified' ? (
                    <span className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Practitioner
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-950/80 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-sans">
                      Verification: {artist.verificationStatus}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#c98d48] font-sans">
                  <span className="font-medium text-sm text-[#f0c88f]">
                    {artist.artForm}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#baa894]">
                    <MapPin className="w-3.5 h-3.5 text-[#c98d48]" />
                    {artist.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#baa894]">
                    <Clock className="w-3.5 h-3.5 text-[#c98d48]" />
                    {artist.yearsExperience} Years Dedication
                  </span>
                </div>

                {artist.languages && artist.languages.length > 0 && (
                  <div className="text-xs text-[#8e7e6e] font-sans">
                    Languages: {artist.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* CTA Book Appointment + Social Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => onBookAppointment(artist)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#c98d48] hover:bg-[#dca45d] text-[#120f0d] font-semibold font-sans rounded-xl transition-all shadow-lg active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleLike}
                  className={`p-3 rounded-xl border transition-all ${
                    isLiked
                      ? 'bg-rose-950 border-rose-500 text-rose-400'
                      : 'bg-[#221c17] border-[#3e3227] text-[#baa894] hover:text-white'
                  }`}
                  title="Like Artist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`p-3 rounded-xl border transition-all ${
                    isSaved
                      ? 'bg-amber-950 border-[#c98d48] text-[#c98d48]'
                      : 'bg-[#221c17] border-[#3e3227] text-[#baa894] hover:text-white'
                  }`}
                  title="Save Artist"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#c98d48]' : ''}`} />
                </button>

                <button
                  onClick={() =>
                    onShare(
                      artist.artistName,
                      `Connect with verified artist ${artist.artistName} (${artist.artForm}) on GanaKala Loka!`
                    )
                  }
                  className="p-3 rounded-xl bg-[#221c17] border border-[#3e3227] text-[#baa894] hover:text-white transition-all"
                  title="Share Profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6 pt-6 border-t border-[#31261e]">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#baa691] mb-2">
              Biographical Narrative & Heritage Practice
            </h3>
            <p className="text-sm sm:text-base text-[#d8cdbd] leading-relaxed max-w-4xl font-body">
              {artist.bio}
            </p>
            {artist.portfolioUrl && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-[#c98d48] font-sans">
                <Globe className="w-3.5 h-3.5" />
                <a
                  href={artist.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {artist.portfolioUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation for Artist Portfolio */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-10">
        <div className="flex items-center gap-2 border-b border-[#3b2f24] pb-2 text-xs font-sans">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'videos'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold'
                : 'text-[#baa894] hover:bg-[#221c17]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Performance Videos ({videos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('works')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'works'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold'
                : 'text-[#baa894] hover:bg-[#221c17]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Artworks & Visuals ({artworks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('awards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'awards'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold'
                : 'text-[#baa894] hover:bg-[#221c17]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Honors & Achievements ({achievements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'posts'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold'
                : 'text-[#baa894] hover:bg-[#221c17]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discourses & Posts ({posts.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {/* 1. Performance Videos */}
          {activeTab === 'videos' && (
            <div>
              {videos.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3b2f24] text-[#8e7e6e]">
                  <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-lg text-[#ccc]">
                    No videos published yet by this artist.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {videos.map((vid) => (
                    <Card3D
                      key={vid.id}
                      onClick={() => onPlayVideo(vid)}
                      className="bg-[#171310] border border-[#3b2f24] hover:border-[#c98d48] p-3 group"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-[#c98d48] text-[#120f0d] flex items-center justify-center shadow">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <h4 className="font-serif text-base text-[#f5ebd7] truncate group-hover:text-[#f8c88f]">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-[#c98d48]">{vid.cultureName}</p>
                      <p className="text-[11px] text-[#918171] line-clamp-2 mt-1">
                        {vid.description}
                      </p>
                    </Card3D>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Artworks */}
          {activeTab === 'works' && (
            <div>
              {artworks.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3b2f24] text-[#8e7e6e]">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-lg text-[#ccc]">
                    No artworks cataloged yet by this artist.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {artworks.map((art) => (
                    <Card3D
                      key={art.id}
                      onClick={() => onViewArtwork(art)}
                      className="bg-[#171310] border border-[#3b2f24] hover:border-[#c98d48] p-3 group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-black mb-2">
                        <img
                          src={art.mediaUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h4 className="font-serif text-base text-[#f5ebd7] truncate group-hover:text-[#f8c88f]">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[#c98d48]">{art.cultureName}</p>
                      <p className="text-[11px] text-[#918171] line-clamp-2 mt-1">
                        {art.description}
                      </p>
                    </Card3D>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Achievements */}
          {activeTab === 'awards' && (
            <div className="space-y-4">
              {achievements.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3b2f24] text-[#8e7e6e]">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-lg text-[#ccc]">
                    No honors recorded yet.
                  </p>
                </div>
              ) : (
                achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-5 rounded-xl bg-[#171310] border border-[#3b2f24] flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-[#2e2319] border border-[#c98d48]/40 text-[#f0c88f]">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg text-[#f5ebd7]">{ach.title}</h4>
                        <span className="text-[10px] font-mono text-[#c98d48] bg-[#2a2017] px-2 py-0.5 rounded border border-[#483726]">
                          {ach.year}
                        </span>
                      </div>
                      <p className="text-xs text-[#c98d48] font-sans mt-0.5">
                        Conferred by {ach.organization} • {ach.badgeType}
                      </p>
                      <p className="text-xs text-[#b8a794] mt-1.5 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. Posts */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3b2f24] text-[#8e7e6e]">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-lg text-[#ccc]">
                    No cultural discourses posted yet.
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-6 rounded-2xl bg-[#171310] border border-[#3b2f24] space-y-3"
                  >
                    <h4 className="font-serif text-xl text-[#f5ebd7]">{post.title}</h4>
                    <p className="text-sm text-[#ded3c3] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                    {post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="rounded-xl max-h-80 w-full object-cover"
                      />
                    )}
                    <div className="text-[10px] text-[#7a6b5d] font-mono">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Social Comments & Endorsements Section */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#171310] border-2 border-[#3d3024] space-y-6">
          <div className="flex items-center justify-between border-b border-[#31251c] pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#c98d48]" />
              <h3 className="font-serif text-2xl text-[#f5ebd7]">
                Community Discourses & Reflections ({comments.length})
              </h3>
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave respectful feedback, reflection, or homage for the artist..."
              className="flex-1 bg-[#221c18] border border-[#443629] rounded-xl px-4 py-2.5 text-xs text-[#ede5d8] placeholder-[#796b5d] focus:outline-none focus:border-[#c98d48]"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2.5 bg-[#c98d48] hover:bg-[#d89c56] disabled:opacity-50 text-[#120f0d] font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-[#8c7b6a] italic">
                No reflections recorded yet. Be the first to express appreciation.
              </p>
            ) : (
              comments.map((com) => (
                <div
                  key={com.id}
                  className="p-3.5 rounded-xl bg-[#1e1814] border border-[#382b21] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={com.userAvatar}
                      alt={com.userName}
                      className="w-8 h-8 rounded-full bg-[#2a2017] border border-[#4e3d2f]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#f0e4d2]">
                          {com.userName}
                        </span>
                        <span className="text-[10px] text-[#78695c]">
                          {new Date(com.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#ded1c0] mt-1 leading-snug">{com.text}</p>
                    </div>
                  </div>

                  {currentUser && currentUser.id === com.userId && (
                    <button
                      onClick={() => handleDeleteComment(com.id)}
                      className="text-[#8c7a69] hover:text-rose-400 p-1"
                      title="Delete your comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
