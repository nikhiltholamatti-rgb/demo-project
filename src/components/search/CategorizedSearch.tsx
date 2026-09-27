import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Sparkles,
  Play,
  Image as ImageIcon,
  User,
  Compass,
  ArrowRight,
  BookOpen,
  PlusCircle,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { Culture, ArtistProfile, Video, Artwork, Post } from '../../types';
import { geminiService, CultureDiscoveryResult } from '../../services/geminiService';

interface CategorizedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCulture: (slug: string) => void;
  onSelectArtist: (artistId: string) => void;
  onPlayVideo: (video: Video) => void;
  onViewArtwork: (artwork: Artwork) => void;
}

export const CategorizedSearch: React.FC<CategorizedSearchProps> = ({
  isOpen,
  onClose,
  onSelectCulture,
  onSelectArtist,
  onPlayVideo,
  onViewArtwork,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // AI Cultural Discovery fallback for uncataloged cultures
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<CultureDiscoveryResult | null>(null);

  // Debounce input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute database search across categories
  useEffect(() => {
    if (!debouncedQuery) {
      setCultures([]);
      setArtists([]);
      setVideos([]);
      setArtworks([]);
      setPosts([]);
      setDiscoveryResult(null);
      return;
    }

    const term = debouncedQuery.toLowerCase();

    // 1. Search Cultures
    const allCultures = db.cultures.getAll();
    const matchedCultures = allCultures.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.canonicalName.toLowerCase().includes(term) ||
        c.region.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.overview.toLowerCase().includes(term)
    );
    setCultures(matchedCultures);

    // 2. Search Artists
    const allArtists = db.artists.getAll();
    const matchedArtists = allArtists.filter(
      (a) =>
        a.artistName.toLowerCase().includes(term) ||
        a.artForm.toLowerCase().includes(term) ||
        a.location.toLowerCase().includes(term) ||
        a.bio.toLowerCase().includes(term)
    );
    setArtists(matchedArtists);

    // 3. Search Videos
    const allVideos = db.videos.getAll();
    const matchedVideos = allVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        v.cultureName.toLowerCase().includes(term) ||
        v.artistName.toLowerCase().includes(term) ||
        v.tags.some((t) => t.toLowerCase().includes(term))
    );
    setVideos(matchedVideos);

    // 4. Search Artworks
    const allArtworks = db.artworks.getAll();
    const matchedArtworks = allArtworks.filter(
      (w) =>
        w.title.toLowerCase().includes(term) ||
        w.cultureName.toLowerCase().includes(term) ||
        w.artistName.toLowerCase().includes(term) ||
        w.tags.some((t) => t.toLowerCase().includes(term))
    );
    setArtworks(matchedArtworks);

    // 5. Search Posts
    const allPosts = db.posts.getAll();
    const matchedPosts = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term) ||
        p.cultureName.toLowerCase().includes(term)
    );
    setPosts(matchedPosts);

    // If query has at least 3 characters and no cultures found in DB, trigger Gemini cultural identification!
    if (matchedCultures.length === 0 && debouncedQuery.length >= 3) {
      setIsDiscovering(true);
      geminiService
        .discoverCultureAI(debouncedQuery)
        .then((res) => {
          setDiscoveryResult(res);
        })
        .finally(() => {
          setIsDiscovering(false);
        });
    } else {
      setDiscoveryResult(null);
    }
  }, [debouncedQuery]);

  if (!isOpen) return null;

  const totalResults =
    cultures.length + artists.length + videos.length + artworks.length + posts.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#181412] border-2 border-[#47392c] rounded-2xl shadow-2xl p-4 sm:p-6 my-8 text-[#ede5d8]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#3b3026]">
          <Search className="w-5 h-5 text-[#c98d48]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Indian art forms, ragas, verified artists, videos (e.g. Kathakali, Yakshagana, Sitar)..."
            className="flex-1 bg-transparent text-base sm:text-lg text-[#f4ecd9] placeholder-[#8c7b6a] focus:outline-none font-serif"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#8c7b6a] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#27201a] border border-[#3e3227] text-[#baa894] hover:text-white ml-2 text-xs font-sans"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {debouncedQuery && totalResults === 0 && !isDiscovering && !discoveryResult && (
            <div className="text-center py-12 text-[#9a8977] space-y-2">
              <Compass className="w-8 h-8 mx-auto text-[#c98d48] opacity-50" />
              <p className="font-serif text-lg text-[#f0e6d6]">No direct matches found</p>
              <p className="text-xs max-w-sm mx-auto">
                No indexed artworks or artists match "{debouncedQuery}". Try searching for
                classic disciplines like Kathakali, Bharatanatyam, or Carnatic Music.
              </p>
            </div>
          )}

          {/* AI Cultural Discovery Fallback (When Culture is not yet in database) */}
          {discoveryResult && discoveryResult.isRecognized && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#241a12] to-[#1c150f] border-2 border-[#c98d48]/60 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c98d48] animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#dca363]">
                    Gemini Heritage Discovery • Uncataloged Cultural Form
                  </span>
                </div>
                <span className="text-[10px] font-sans bg-[#3b2b1d] text-[#e8b982] px-2 py-0.5 rounded border border-[#6b4e33]">
                  {discoveryResult.category || 'Indian Heritage'}
                </span>
              </div>

              <div>
                <h4 className="font-serif text-2xl text-[#f6ebd9]">
                  {discoveryResult.canonicalName || debouncedQuery}
                </h4>
                <p className="text-xs text-[#b89569] font-sans">
                  Origin Region: {discoveryResult.region || 'India'}
                </p>
              </div>

              <p className="text-sm text-[#ddd2c2] leading-relaxed font-body">
                {discoveryResult.overview}
              </p>

              {discoveryResult.costumes && (
                <div className="text-xs text-[#baa995] bg-[#14100d] p-3 rounded-lg border border-[#382b20]">
                  <strong className="text-[#e2bd89]">Costumes & Aharya: </strong>
                  {discoveryResult.costumes}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#8e7f70] italic">
                  Identified via Gemini Cultural Archive.
                </span>
                <button
                  onClick={() => {
                    const newCulture: Culture = {
                      id: `cult-${Date.now()}`,
                      slug: (discoveryResult.canonicalName || debouncedQuery)
                        .toLowerCase()
                        .replace(/\s+/g, '-'),
                      name: discoveryResult.canonicalName || debouncedQuery,
                      canonicalName: discoveryResult.canonicalName || debouncedQuery,
                      category: 'Traditional Art & Craft',
                      region: discoveryResult.region || 'India',
                      overview: discoveryResult.overview || '',
                      history: discoveryResult.history || 'Ancient regional Indian tradition.',
                      significance: discoveryResult.significance || 'Cultural community treasure.',
                      performanceStyle: discoveryResult.performanceStyle || 'Traditional form.',
                      costumes: discoveryResult.costumes || 'Regional attire.',
                      instruments: discoveryResult.instruments || 'Traditional accompaniment.',
                      traditions: discoveryResult.traditions || 'Festive celebrations.',
                      bannerUrl:
                        'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1600&q=80',
                      imagePlate:
                        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
                      accentColor: '#c98d48',
                      createdAt: new Date().toISOString(),
                    };
                    db.cultures.addCulture(newCulture);
                    onSelectCulture(newCulture.slug);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-lg bg-[#c98d48] text-[#13100e] hover:bg-[#d89c56] transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Open Dedicated Archive Page</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. Categorized Cultures */}
          {cultures.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#c98d48]" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#baa691]">
                  Indian Cultures ({cultures.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cultures.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCulture(c.slug);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#221c18] border border-[#3e3126] hover:border-[#c98d48] transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <img
                      src={c.imagePlate}
                      alt={c.name}
                      className="w-14 h-14 rounded-lg object-cover border border-[#483a2d]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#c98d48] font-sans">
                        {c.category}
                      </span>
                      <h5 className="font-serif text-base text-[#f5ebd7] group-hover:text-[#f8c88f] transition-colors truncate">
                        {c.name}
                      </h5>
                      <p className="text-[11px] text-[#9c8b78] truncate">{c.region}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8a7a6b] group-hover:text-[#c98d48] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Categorized Artists */}
          {artists.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#c98d48]" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#baa691]">
                  Verified Artists ({artists.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artists.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onSelectArtist(a.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#221c18] border border-[#3e3126] hover:border-[#c98d48] transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#34271c] border border-[#c98d48]/40 flex items-center justify-center font-serif text-lg text-[#f0c88f]">
                      {a.artistName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-serif text-base text-[#f5ebd7] truncate">
                          {a.artistName}
                        </h5>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1 rounded">
                          ✓
                        </span>
                      </div>
                      <p className="text-xs text-[#c98d48]">{a.artForm}</p>
                      <p className="text-[10px] text-[#938372] truncate">{a.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Categorized Videos (Performance Media) */}
          {videos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-[#c98d48]" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#baa691]">
                  Cultural Performances & Videos ({videos.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onPlayVideo(v);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#221c18] border border-[#3e3126] hover:border-[#c98d48] transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-[#f5ebd7] truncate group-hover:text-[#f8c88f]">
                        {v.title}
                      </h5>
                      <p className="text-[11px] text-[#c98d48] truncate">
                        {v.artistName} • {v.cultureName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Categorized Artworks */}
          {artworks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-[#c98d48]" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#baa691]">
                  Artworks & Artifacts ({artworks.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artworks.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      onViewArtwork(art);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#221c18] border border-[#3e3126] hover:border-[#c98d48] transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <img
                      src={art.mediaUrl}
                      alt={art.title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#483a2d]"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-[#f5ebd7] truncate">
                        {art.title}
                      </h5>
                      <p className="text-[11px] text-[#c98d48]">{art.artistName}</p>
                      <p className="text-[10px] text-[#938372]">{art.cultureName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
