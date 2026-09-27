import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  Send,
  Play,
  User,
  Music,
  Calendar,
  Layers,
  ShieldCheck,
  MapPin,
  Clock,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { Culture, ArtistProfile, Video, UserProfile } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Card3D } from '../common/Card3D';

interface CultureDetailPageProps {
  slug: string;
  currentUser: UserProfile | null;
  onBack: () => void;
  onSelectArtist: (artistId: string) => void;
  onPlayVideo: (video: Video) => void;
  onBookAppointment: (artist: ArtistProfile) => void;
  onRequireAuth: () => void;
  onShare: (title: string, text: string) => void;
}

export const CultureDetailPage: React.FC<CultureDetailPageProps> = ({
  slug,
  currentUser,
  onBack,
  onSelectArtist,
  onPlayVideo,
  onBookAppointment,
  onRequireAuth,
  onShare,
}) => {
  const [culture, setCulture] = useState<Culture | null>(null);
  const [relatedArtists, setRelatedArtists] = useState<ArtistProfile[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Gemini "Ask GanaKala AI" Chat state
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);

  useEffect(() => {
    const loadedCulture = db.cultures.getBySlug(slug);
    if (loadedCulture) {
      setCulture(loadedCulture);

      // Query database for artists and videos tagged to this specific culture!
      const artists = db.artists.getByCulture(loadedCulture.name);
      setRelatedArtists(artists);

      const videos = db.videos.getByCulture(loadedCulture.id);
      setRelatedVideos(videos);

      setLikesCount(db.likes.getCount(loadedCulture.id));
      if (currentUser) {
        setIsLiked(db.likes.hasLiked(currentUser.id, loadedCulture.id));
        setIsSaved(db.saves.hasSaved(currentUser.id, loadedCulture.id));
      }

      // Initial welcome message from GanaKala AI
      setChatMessages([
        {
          role: 'assistant',
          content: `Pranam! I am GanaKala AI, your scholar guide for ${loadedCulture.name}. Ask me about the historical Natya Shastra roots, tala/raga cycles, mudra symbolism, or costume secrets.`,
        },
      ]);
    }
  }, [slug, currentUser]);

  if (!culture) {
    return (
      <div className="min-h-screen bg-[#13110e] flex items-center justify-center p-6 text-center text-[#ddd]">
        <div>
          <h2 className="font-serif text-3xl mb-2">Culture Not Found</h2>
          <p className="text-sm text-[#888] mb-4">
            The requested cultural lineage is not present in the current archive.
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
    const newLiked = db.likes.toggle(currentUser.id, culture.id, 'artwork');
    setIsLiked(newLiked);
    setLikesCount(db.likes.getCount(culture.id));
  };

  const handleToggleSave = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const newSaved = db.saves.toggle(currentUser.id, {
      targetId: culture.id,
      targetType: 'culture',
      title: culture.name,
      subtitle: `${culture.category} • ${culture.region}`,
      imageUrl: culture.imagePlate,
    });
    setIsSaved(newSaved);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userQ = question.trim();
    setQuestion('');
    const newHistory = [...chatMessages, { role: 'user' as const, content: userQ }];
    setChatMessages(newHistory);
    setIsAsking(true);

    try {
      const answer = await geminiService.askCultureAI(culture.name, userQ, newHistory);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Apologies, my cultural transmission was briefly interrupted. Please ask again.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120f0e] text-[#ede6d8] pb-24 font-body">
      {/* Hero Banner with Gold Embellishments */}
      <div className="relative w-full h-[380px] sm:h-[460px] overflow-hidden border-b-2 border-[#3d3126]">
        <img
          src={culture.bannerUrl}
          alt={culture.name}
          className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120f0e] via-[#120f0e]/50 to-black/40" />

        {/* Back and Social Buttons */}
        <div className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-[#524132] text-xs font-sans text-[#f2e7d7] transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-4 h-4 text-[#c98d48]" />
            <span>Back to Explorer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
                isLiked
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400'
                  : 'bg-black/60 border-[#524132] text-[#baa794] hover:text-white'
              }`}
              title="Like this culture"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-amber-950/80 border-[#c98d48] text-[#c98d48]'
                  : 'bg-black/60 border-[#524132] text-[#baa794] hover:text-white'
              }`}
              title="Save to your GanaKala collection"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#c98d48]' : ''}`} />
            </button>

            <button
              onClick={() =>
                onShare(
                  culture.name,
                  `Explore ${culture.name} (${culture.region}) on GanaKala Loka!`
                )
              }
              className="p-2.5 rounded-xl bg-black/60 border border-[#524132] text-[#baa794] hover:text-white backdrop-blur-md transition-all"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Culture Hero Titles */}
        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 max-w-4xl z-20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-[#2c221a]/90 text-[#dca363] border border-[#c98d48]/40">
              {culture.category}
            </span>
            <span className="text-xs font-sans text-[#e4d4be] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#c98d48]" />
              {culture.region}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-6xl text-[#f6eedf] tracking-tight mb-1 drop-shadow-lg">
            {culture.name}
          </h1>
          <p className="text-sm sm:text-base text-[#caa578] italic font-serif">
            {culture.canonicalName}
          </p>
        </div>
      </div>

      {/* Main Culture Dossier Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Comprehensive Heritage Dossier + Media Connections (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Overview */}
          <section className="bg-[#171310] p-6 sm:p-8 rounded-2xl border border-[#3e3126] shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-[#c98d48]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#baa691]">
                Overview & Philosophical Essence
              </h2>
            </div>
            <p className="text-base sm:text-lg text-[#ded3c3] leading-relaxed font-body">
              {culture.overview}
            </p>
          </section>

          {/* History & Cultural Significance */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#171310] p-6 rounded-2xl border border-[#3e3126] shadow-lg">
              <div className="text-xs font-mono uppercase tracking-widest text-[#c98d48] mb-2">
                Origin & Historical Lineage
              </div>
              <p className="text-sm text-[#c8bcae] leading-relaxed">{culture.history}</p>
            </div>

            <div className="bg-[#171310] p-6 rounded-2xl border border-[#3e3126] shadow-lg">
              <div className="text-xs font-mono uppercase tracking-widest text-[#c98d48] mb-2">
                Cultural & Sacred Significance
              </div>
              <p className="text-sm text-[#c8bcae] leading-relaxed">
                {culture.significance}
              </p>
            </div>
          </section>

          {/* Performance Style, Costumes (Aharya), Instruments, Traditions */}
          <section className="bg-[#171310] p-6 sm:p-8 rounded-2xl border border-[#3e3126] space-y-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#c98d48] mb-2">
                Performance Style & Movement Aesthetics
              </h3>
              <p className="text-sm sm:text-base text-[#ded3c3] leading-relaxed">
                {culture.performanceStyle}
              </p>
            </div>

            <div className="border-t border-[#2e241c] pt-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#c98d48] mb-2">
                Costumes, Makeup & Aharya Abhinaya
              </h3>
              <p className="text-sm sm:text-base text-[#ded3c3] leading-relaxed">
                {culture.costumes}
              </p>
            </div>

            <div className="border-t border-[#2e241c] pt-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#c98d48] mb-2 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-[#c98d48]" />
                Accompanying Instruments & Percussion
              </h3>
              <p className="text-sm sm:text-base text-[#ded3c3] leading-relaxed">
                {culture.instruments}
              </p>
            </div>

            <div className="border-t border-[#2e241c] pt-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#c98d48] mb-2">
                Rituals, Seasons & Temple Traditions
              </h3>
              <p className="text-sm sm:text-base text-[#ded3c3] leading-relaxed">
                {culture.traditions}
              </p>
            </div>
          </section>

          {/* Core Feature: CULTURE + VIDEO CONNECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-[#c98d48]" />
                <h3 className="font-serif text-2xl text-[#f5ecd9]">
                  Related Performance Videos ({relatedVideos.length})
                </h3>
              </div>
              <span className="text-xs text-[#8a7a6b] font-sans">
                Direct artist uploads tagged to {culture.name}
              </span>
            </div>

            {relatedVideos.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#171310] border border-[#3e3126] text-center text-[#8e7e6f]">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-serif text-[#bbb]">
                  No artist videos have been uploaded for this culture yet.
                </p>
                <p className="text-xs text-[#777] mt-1">
                  Verified artists who perform {culture.name} can upload their
                  recordings from the Artist Studio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedVideos.map((video) => (
                  <Card3D
                    key={video.id}
                    onClick={() => onPlayVideo(video)}
                    className="bg-[#1a1613] border border-[#3c3025] hover:border-[#c98d48] p-3 group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2.5">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                        <div className="w-10 h-10 rounded-full bg-[#c98d48] text-[#13100e] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-[#f0dfcc]">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-base text-[#f5ebd7] truncate group-hover:text-[#f8c88f]">
                      {video.title}
                    </h4>
                    <p className="text-xs text-[#c98d48] truncate">By {video.artistName}</p>
                    <p className="text-[11px] text-[#918171] line-clamp-2 mt-1">
                      {video.description}
                    </p>
                  </Card3D>
                ))}
              </div>
            )}
          </section>

          {/* Related Verified Artists */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#c98d48]" />
                <h3 className="font-serif text-2xl text-[#f5ecd9]">
                  Practitioners & Gurus ({relatedArtists.length})
                </h3>
              </div>
            </div>

            {relatedArtists.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#171310] border border-[#3e3126] text-center text-[#8e7e6f]">
                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-serif text-[#bbb]">
                  No verified artists found for this culture yet.
                </p>
                <p className="text-xs text-[#777] mt-1">
                  Are you a practitioner of {culture.name}? Register your artist account
                  to showcase your lineage.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="p-5 rounded-2xl bg-[#1a1613] border border-[#3e3126] hover:border-[#c98d48] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#2e231a] border border-[#c98d48]/50 flex items-center justify-center font-serif text-xl text-[#f0c88f]">
                          {artist.artistName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4
                              onClick={() => onSelectArtist(artist.id)}
                              className="font-serif text-lg text-[#f5ebd7] hover:text-[#f0c88f] cursor-pointer"
                            >
                              {artist.artistName}
                            </h4>
                            {artist.verificationStatus === 'Verified' && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1 rounded border border-emerald-500/40">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#c98d48]">
                            {artist.artForm} • {artist.yearsExperience} yrs exp
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#b8a794] line-clamp-2 leading-relaxed">
                      {artist.bio}
                    </p>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => onSelectArtist(artist.id)}
                        className="flex-1 py-1.5 text-xs font-sans rounded-lg bg-[#27201a] hover:bg-[#342a22] text-[#d6c7b4] border border-[#44372a] transition-all"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => onBookAppointment(artist)}
                        className="flex-1 py-1.5 text-xs font-sans font-semibold rounded-lg bg-[#c98d48] hover:bg-[#dca45d] text-[#13100e] transition-all flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: "Ask GanaKala AI" Conversational Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 bg-[#16120f] border-2 border-[#524132] rounded-2xl p-5 shadow-2xl flex flex-col h-[640px]">
            {/* AI Header */}
            <div className="pb-3 border-b border-[#362b22] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c98d48] to-[#6d451e] flex items-center justify-center shadow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#f4ecd9]">Ask GanaKala AI</h3>
                  <p className="text-[10px] text-[#baa794]">
                    Specialist Scholar for {culture.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Transcript */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-[#221c17] text-[#e0d4c3] border border-[#3e3125]'
                      : 'bg-[#c98d48] text-[#14110e] font-sans font-medium ml-4'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="text-[9px] font-mono text-[#c98d48] uppercase mb-1">
                      GanaKala Scholar
                    </div>
                  )}
                  {msg.content}
                </div>
              ))}
              {isAsking && (
                <div className="p-3 rounded-xl bg-[#221c17] border border-[#3e3125] text-xs text-[#a99986] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#c98d48] animate-spin" />
                  <span>Consulting classical treatises...</span>
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div className="py-2 border-t border-[#2e241c] flex flex-wrap gap-1.5">
              <button
                onClick={() => setQuestion(`What is the spiritual significance of ${culture.name}?`)}
                className="text-[10px] font-sans bg-[#201915] hover:bg-[#2b221d] text-[#c5b4a0] border border-[#3b2f24] px-2 py-1 rounded transition-colors"
              >
                Spiritual meaning?
              </button>
              <button
                onClick={() => setQuestion(`What instruments are essential for ${culture.name}?`)}
                className="text-[10px] font-sans bg-[#201915] hover:bg-[#2b221d] text-[#c5b4a0] border border-[#3b2f24] px-2 py-1 rounded transition-colors"
              >
                Instruments?
              </button>
              <button
                onClick={() => setQuestion(`Explain the costume and makeup in ${culture.name}.`)}
                className="text-[10px] font-sans bg-[#201915] hover:bg-[#2b221d] text-[#c5b4a0] border border-[#3b2f24] px-2 py-1 rounded transition-colors"
              >
                Costumes & Aharya?
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskAI} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask anything about ${culture.name}...`}
                className="flex-1 bg-[#221c18] border border-[#43362a] rounded-lg px-3 py-2 text-xs text-[#ede5d8] placeholder-[#7a6b5e] focus:outline-none focus:border-[#c98d48]"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="p-2 bg-[#c98d48] hover:bg-[#d89c56] disabled:opacity-40 text-[#120f0d] rounded-lg transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
