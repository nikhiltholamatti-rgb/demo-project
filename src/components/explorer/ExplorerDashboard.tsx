import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  Calendar,
  Bookmark,
  Play,
  User,
  ShieldCheck,
  ArrowRight,
  Filter,
  Layers,
  Heart,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import {
  Culture,
  ArtistProfile,
  Video,
  Artwork,
  Appointment,
  SaveItem,
  UserProfile,
} from '../../types';
import { CultureCard } from '../culture/CultureCard';
import { Card3D } from '../common/Card3D';

interface ExplorerDashboardProps {
  currentUser: UserProfile | null;
  onSelectCulture: (slug: string) => void;
  onSelectArtist: (artistId: string) => void;
  onPlayVideo: (video: Video) => void;
  onViewArtwork: (artwork: Artwork) => void;
  onOpenSearch: () => void;
  onRequireAuth: () => void;
  onBookAppointment: (artist: ArtistProfile) => void;
}

export const ExplorerDashboard: React.FC<ExplorerDashboardProps> = ({
  currentUser,
  onSelectCulture,
  onSelectArtist,
  onPlayVideo,
  onViewArtwork,
  onOpenSearch,
  onRequireAuth,
  onBookAppointment,
}) => {
  const [activeTab, setActiveTab] = useState<'cultures' | 'artists' | 'videos' | 'saved' | 'appointments'>('cultures');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [cultures, setCultures] = useState<Culture[]>([]);
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [savedItems, setSavedItems] = useState<SaveItem[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  const reloadData = () => {
    setCultures(db.cultures.getAll());
    setArtists(db.artists.getVerified());
    setVideos(db.videos.getAll());
    if (currentUser) {
      setSavedItems(db.saves.getUserSaves(currentUser.id));
      setMyAppointments(db.appointments.getForExplorer(currentUser.id));
    }
  };

  useEffect(() => {
    reloadData();
    window.addEventListener('ganakala_data_changed', reloadData);
    return () => window.removeEventListener('ganakala_data_changed', reloadData);
  }, [currentUser]);

  const categories = [
    'All',
    'Classical Dance',
    'Classical Music',
    'Folk & Ritual Theatre',
    'Martial Art',
    'Traditional Art & Craft',
  ];

  const filteredCultures =
    selectedCategory === 'All'
      ? cultures
      : cultures.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#120f0e] text-[#ede6d8] pb-24 font-body">
      {/* Hero Welcome Banner */}
      <div className="relative border-b border-[#3d3126] bg-gradient-to-b from-[#1c1613] via-[#161210] to-[#120f0e] px-4 sm:px-8 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27201b] border border-[#c98d48]/40 text-xs font-mono text-[#dca363]">
            <Sparkles className="w-3.5 h-3.5 text-[#c98d48]" />
            <span>Living Digital Codex of Indian Arts</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#f6eedf] tracking-tight">
            Discover the Soul of Indian Heritage
          </h1>

          <p className="text-sm sm:text-base text-[#baa794] max-w-2xl font-body">
            Explore millennia of classical dances, sacred ragas, ritual theatre, and living
            crafts. Connect with verified masters, watch authentic performances, and delve
            into our cultural codex.
          </p>

          {/* Quick Search Bar trigger */}
          <div className="pt-2 max-w-xl">
            <div
              onClick={onOpenSearch}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#201915] border-2 border-[#47392c] hover:border-[#c98d48] text-[#8e7e6e] cursor-pointer transition-all shadow-lg group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-[#c98d48]" />
                <span className="text-xs sm:text-sm font-sans text-[#a89887] group-hover:text-[#ddd]">
                  Search Kathakali, Yakshagana, Bharatanatyam, Sitar, Artists...
                </span>
              </div>
              <span className="text-[11px] font-mono bg-[#2a221b] border border-[#44362a] px-2 py-0.5 rounded text-[#baa894]">
                ⌘K
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#352a20] pb-3 text-xs font-sans">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('cultures')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'cultures'
                  ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                  : 'text-[#baa894] hover:bg-[#201915]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>🇮🇳 Indian Culture</span>
            </button>

            <button
              onClick={() => setActiveTab('artists')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'artists'
                  ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                  : 'text-[#baa894] hover:bg-[#201915]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>🎨 Explore Artists ({artists.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'videos'
                  ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                  : 'text-[#baa894] hover:bg-[#201915]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Performances ({videos.length})</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  onRequireAuth();
                  return;
                }
                setActiveTab('saved');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'saved'
                  ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                  : 'text-[#baa894] hover:bg-[#201915]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>❤️ Saved ({savedItems.length})</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  onRequireAuth();
                  return;
                }
                setActiveTab('appointments');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'appointments'
                  ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                  : 'text-[#baa894] hover:bg-[#201915]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>📅 My Appointments ({myAppointments.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: INDIAN CULTURES */}
        {activeTab === 'cultures' && (
          <div className="mt-6 space-y-6">
            {/* Category filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-sans">
              <Filter className="w-3.5 h-3.5 text-[#c98d48] flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#3e3024] text-[#f5ecd9] border border-[#c98d48]/60 font-medium'
                      : 'bg-[#1b1613] text-[#a99986] border border-[#31261d] hover:bg-[#241e18]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Culture Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCultures.map((cult) => (
                <CultureCard
                  key={cult.id}
                  culture={cult}
                  onClick={() => onSelectCulture(cult.slug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: EXPLORE ARTISTS */}
        {activeTab === 'artists' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[#f6eedf]">
                  Verified Cultural Practitioners
                </h3>
                <p className="text-xs text-[#a69683]">
                  All practitioners shown have passed credential verification with lineage authentication.
                </p>
              </div>
            </div>

            {artists.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3e3126] text-[#8e7e6e]">
                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-serif text-lg text-[#ccc]">No verified artists found yet.</p>
                <p className="text-xs text-[#777] mt-1">
                  Practitioners can register an Artist account to showcase their art form.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <Card3D
                    key={artist.id}
                    className="p-5 rounded-2xl bg-[#171310] border border-[#3d3126] hover:border-[#c98d48] flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#2e2319] border border-[#c98d48]/50 flex items-center justify-center font-serif text-xl text-[#f0c88f]">
                            {artist.artistName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4
                                onClick={() => onSelectArtist(artist.id)}
                                className="font-serif text-lg text-[#f5ebd7] group-hover:text-[#f0c88f] transition-colors cursor-pointer"
                              >
                                {artist.artistName}
                              </h4>
                              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1 rounded border border-emerald-500/40">
                                ✓
                              </span>
                            </div>
                            <p className="text-xs text-[#c98d48]">{artist.artForm}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#b8a794] line-clamp-3 leading-relaxed mt-3 font-body">
                        {artist.bio}
                      </p>

                      <div className="mt-3 text-[11px] text-[#8e7e6e] font-sans flex items-center justify-between">
                        <span>{artist.location}</span>
                        <span>{artist.yearsExperience} yrs exp</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#2e2319] flex items-center gap-2">
                      <button
                        onClick={() => onSelectArtist(artist.id)}
                        className="flex-1 py-1.5 text-xs font-sans rounded-lg bg-[#241e18] hover:bg-[#31271f] text-[#d6c7b3] border border-[#433527] transition-all"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => onBookAppointment(artist)}
                        className="flex-1 py-1.5 text-xs font-sans font-semibold rounded-lg bg-[#c98d48] hover:bg-[#dca45d] text-[#13100e] transition-all flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book</span>
                      </button>
                    </div>
                  </Card3D>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: PERFORMANCE VIDEOS */}
        {activeTab === 'videos' && (
          <div className="mt-6 space-y-6">
            <h3 className="font-serif text-2xl text-[#f6eedf]">
              Authentic Performance Recordings
            </h3>

            {videos.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3e3126] text-[#8e7e6e]">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-serif text-lg text-[#ccc]">No performance videos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid) => (
                  <Card3D
                    key={vid.id}
                    onClick={() => onPlayVideo(vid)}
                    className="p-3 bg-[#171310] border border-[#3e3126] hover:border-[#c98d48] group"
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
                      {vid.duration && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-[#f0dfcc]">
                          {vid.duration}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-base text-[#f5ebd7] truncate group-hover:text-[#f8c88f]">
                      {vid.title}
                    </h4>
                    <p className="text-xs text-[#c98d48] truncate">
                      {vid.artistName} • {vid.cultureName}
                    </p>
                    <p className="text-[11px] text-[#918171] line-clamp-2 mt-1">
                      {vid.description}
                    </p>
                  </Card3D>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: SAVED TREASURES */}
        {activeTab === 'saved' && (
          <div className="mt-6 space-y-6">
            <h3 className="font-serif text-2xl text-[#f6eedf]">
              Saved Cultures & Artworks ({savedItems.length})
            </h3>

            {savedItems.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3e3126] text-[#8e7e6e]">
                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-serif text-lg text-[#ccc]">No saved items yet.</p>
                <p className="text-xs text-[#777] mt-1">
                  Click the bookmark icon on any culture or artist profile to save it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.targetType === 'culture') {
                        onSelectCulture(item.targetId.replace('culture-', ''));
                      } else if (item.targetType === 'artist') {
                        onSelectArtist(item.targetId);
                      }
                    }}
                    className="p-3.5 rounded-xl bg-[#171310] border border-[#3e3126] hover:border-[#c98d48] flex items-center gap-3 cursor-pointer transition-all group"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#483727]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-mono text-[#c98d48]">
                        {item.targetType}
                      </span>
                      <h4 className="font-serif text-base text-[#f5ebd7] truncate group-hover:text-[#f8c88f]">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#938372] truncate">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: MY APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="mt-6 space-y-6">
            <h3 className="font-serif text-2xl text-[#f6eedf]">
              My Scheduled Appointments ({myAppointments.length})
            </h3>

            {myAppointments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#171310] border border-[#3e3126] text-[#8e7e6e]">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-serif text-lg text-[#ccc]">No appointments scheduled yet.</p>
                <p className="text-xs text-[#777] mt-1">
                  Browse verified artists and click "Book Appointment" to request a session.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 rounded-2xl bg-[#171310] border border-[#3e3126] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg text-[#f5ebd7]">
                          {appt.artistName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            appt.status === 'Confirmed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                              : appt.status === 'Declined'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          }`}
                        >
                          Status: {appt.status}
                        </span>
                      </div>
                      <p className="text-[#c98d48] font-medium mt-0.5">
                        {appt.purpose} ({appt.artForm})
                      </p>
                      <div className="text-[#8e7e6e] mt-1">
                        Scheduled for: <strong>{appt.date}</strong> at <strong>{appt.time}</strong>
                      </div>
                      {appt.notes && (
                        <p className="text-[#baa894] italic mt-1 font-body">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectArtist(appt.artistId)}
                        className="px-3.5 py-1.5 bg-[#251e18] hover:bg-[#332a21] text-[#ded2c2] border border-[#43362a] rounded-lg transition-all"
                      >
                        View Artist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
