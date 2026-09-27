import React, { useState, useEffect } from 'react';
import { db, fetchAppointmentsFromSupabase } from './lib/supabase';
import {
  UserProfile,
  ArtistProfile,
  Culture,
  Video,
  Artwork,
  NotificationItem,
} from './types';
import { MengToSketchbookLandingPage } from './components/sketchbook/MengToSketchbookLandingPage';
import { Navbar } from './components/common/Navbar';
import { ExplorerDashboard } from './components/explorer/ExplorerDashboard';
import { CultureDetailPage } from './components/culture/CultureDetailPage';
import { ArtistDashboard } from './components/artist/ArtistDashboard';
import { ArtistProfilePage } from './components/artist/ArtistProfilePage';
import { CategorizedSearch } from './components/search/CategorizedSearch';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AppointmentModal } from './components/common/AppointmentModal';
import { MediaModal } from './components/common/MediaModal';
import { ShareModal } from './components/common/ShareModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminRoot } from './components/admin/AdminRoot';
import { Shield } from 'lucide-react';

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  });

  const [activeView, setActiveView] = useState<
    'sketchbook' | 'explorer' | 'artist-dashboard' | 'culture-detail' | 'artist-profile'
  >('sketchbook');

  const [selectedCultureSlug, setSelectedCultureSlug] = useState<string>('kathakali');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('art-demo-1');

  // Auth & Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentArtist, setCurrentArtist] = useState<ArtistProfile | null>(null);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [bookingArtist, setBookingArtist] = useState<ArtistProfile | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: '', text: '' });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Sync user state from storage
  const syncAuthState = () => {
    const user = db.auth.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      if (user.role === 'artist') {
        const art = db.artists.getByUserId(user.id);
        setCurrentArtist(art || null);
      } else {
        setCurrentArtist(null);
      }
      setNotifications(db.notifications.getForUser(user.id));
    } else {
      setCurrentArtist(null);
      setNotifications([]);
    }
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener('ganakala_auth_changed', syncAuthState);
    window.addEventListener('ganakala_data_changed', syncAuthState);

    // Initial sync with remote Supabase appointments
    fetchAppointmentsFromSupabase().then((remoteAppts) => {
      if (remoteAppts.length > 0) {
        const local = db.appointments.getAll();
        const existingIds = new Set(local.map((a) => a.id));
        let added = false;
        remoteAppts.forEach((ra) => {
          if (!existingIds.has(ra.id)) {
            local.push(ra);
            added = true;
          }
        });
        if (added) {
          localStorage.setItem('ganakala_appointments', JSON.stringify(local));
          window.dispatchEvent(new Event('ganakala_data_changed'));
        }
      }
    });

    return () => {
      window.removeEventListener('ganakala_auth_changed', syncAuthState);
      window.removeEventListener('ganakala_data_changed', syncAuthState);
    };
  }, []);

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for navigation to and from /admin
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminMode(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Navigation handlers
  const handleSelectCulture = (slug: string) => {
    setSelectedCultureSlug(slug);
    setActiveView('culture-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArtist = (artistId: string) => {
    setSelectedArtistId(artistId);
    setActiveView('artist-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayVideo = (video: Video) => {
    setActiveVideo(video);
    setActiveArtwork(null);
    setIsMediaModalOpen(true);
  };

  const handleViewArtwork = (artwork: Artwork) => {
    setActiveArtwork(artwork);
    setActiveVideo(null);
    setIsMediaModalOpen(true);
  };

  const handleStartBooking = (artist: ArtistProfile) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setBookingArtist(artist);
    setIsAppointmentModalOpen(true);
  };

  const handleShare = (title: string, text: string) => {
    setShareData({ title, text });
    setIsShareModalOpen(true);
  };

  if (isAdminMode) {
    return (
      <AdminRoot
        onBackToPublicSite={() => {
          setIsAdminMode(false);
          window.history.pushState({}, '', '/');
        }}
        onOpenPublicCulture={(slug) => {
          setIsAdminMode(false);
          setSelectedCultureSlug(slug);
          setActiveView('culture-detail');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#120f0e] text-[#ede6d8] flex flex-col font-body selection:bg-[#c98d48] selection:text-[#120f0e]">
      {/* Universal Navigation Header */}
      <Navbar
        currentUser={currentUser}
        currentArtist={currentArtist}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAppointments={() => {
          if (!currentUser) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
            return;
          }
          if (currentUser.role === 'artist') {
            setActiveView('artist-dashboard');
          } else {
            setActiveView('explorer');
          }
        }}
        onOpenAuth={(mode = 'login') => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onSignOut={() => {
          db.auth.signOut();
          setActiveView('sketchbook');
        }}
        onOpenAdmin={() => {
          window.history.pushState({}, '', '/admin');
          setIsAdminMode(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        notifications={notifications}
      />

      {/* Main Viewport Router */}
      <div className="flex-1">
        {/* VIEW 1: MengToSketchbook Tactile Landing Page */}
        {activeView === 'sketchbook' && (
          <MengToSketchbookLandingPage
            headingFont="Instrument Serif, Georgia, serif"
            bodyFont="Newsreader, Georgia, serif"
            headingWeight="400"
            bodyWeight="400"
            primaryColor="#2b2721"
            headingSize={30}
            bodySize={20}
            headingLetterSpacing={0.01}
            onEnterArtist={() => {
              if (currentUser?.role === 'artist') {
                setActiveView('artist-dashboard');
              } else {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }
            }}
            onEnterExplorer={() => {
              setActiveView('explorer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCulture={handleSelectCulture}
          />
        )}

        {/* VIEW 2: Explorer Heritage Discovery Dashboard */}
        {activeView === 'explorer' && (
          <ExplorerDashboard
            currentUser={currentUser}
            onSelectCulture={handleSelectCulture}
            onSelectArtist={handleSelectArtist}
            onPlayVideo={handlePlayVideo}
            onViewArtwork={handleViewArtwork}
            onOpenSearch={() => setIsSearchOpen(true)}
            onRequireAuth={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onBookAppointment={handleStartBooking}
          />
        )}

        {/* VIEW 3: Culture Detail Dossier & "Ask GanaKala AI" */}
        {activeView === 'culture-detail' && (
          <CultureDetailPage
            slug={selectedCultureSlug}
            currentUser={currentUser}
            onBack={() => setActiveView('explorer')}
            onSelectArtist={handleSelectArtist}
            onPlayVideo={handlePlayVideo}
            onBookAppointment={handleStartBooking}
            onRequireAuth={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onShare={handleShare}
          />
        )}

        {/* VIEW 4: Artist Dashboard (Workspace & Verification) */}
        {activeView === 'artist-dashboard' && currentArtist && currentUser && (
          <ArtistDashboard
            currentUser={currentUser}
            artist={currentArtist}
            onSwitchToExplorer={() => {
              setActiveView('explorer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewPublicProfile={handleSelectArtist}
          />
        )}

        {/* VIEW 5: Public Artist Profile Page */}
        {activeView === 'artist-profile' && (
          <ArtistProfilePage
            artistId={selectedArtistId}
            currentUser={currentUser}
            onBack={() => setActiveView('explorer')}
            onBookAppointment={handleStartBooking}
            onPlayVideo={handlePlayVideo}
            onViewArtwork={handleViewArtwork}
            onRequireAuth={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onShare={handleShare}
          />
        )}
      </div>

      {/* Global Modals & Interactive Drawers */}
      <CategorizedSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCulture={handleSelectCulture}
        onSelectArtist={handleSelectArtist}
        onPlayVideo={handlePlayVideo}
        onViewArtwork={handleViewArtwork}
      />

      {currentUser && (
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          userId={currentUser.id}
          notifications={notifications}
          onOpenAppointments={() => {
            if (currentUser.role === 'artist') {
              setActiveView('artist-dashboard');
            } else {
              setActiveView('explorer');
            }
          }}
        />
      )}

      {bookingArtist && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setBookingArtist(null);
          }}
          artist={bookingArtist}
          currentUser={currentUser}
          onRequireAuth={() => {
            setIsAppointmentModalOpen(false);
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setActiveVideo(null);
          setActiveArtwork(null);
        }}
        video={activeVideo}
        artwork={activeArtwork}
        currentUser={currentUser}
        onSelectArtist={handleSelectArtist}
        onRequireAuth={() => {
          setIsMediaModalOpen(false);
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={shareData.title}
        text={shareData.text}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(user, artist) => {
          setCurrentUser(user);
          if (artist) {
            setCurrentArtist(artist);
            setActiveView('artist-dashboard');
          } else {
            setCurrentArtist(null);
            setActiveView('explorer');
          }
        }}
      />

      {/* Bottom Heritage Footer */}
      <footer className="border-t border-[#31251b] bg-[#14100e] text-[#8e7e6e] text-xs font-sans px-4 sm:px-8 py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-[#c98d48] font-bold">ॐ</span>
            <span className="font-serif text-sm text-[#ded1c0]">GanaKala Loka</span>
            <span>— Preserving & Celebrating Indian Heritage</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveView('sketchbook')}
              className="hover:text-[#c98d48] transition-colors"
            >
              Sketchbook
            </button>
            <button
              onClick={() => setActiveView('explorer')}
              className="hover:text-[#c98d48] transition-colors"
            >
              Cultures
            </button>
            <button
              onClick={() => {
                if (currentUser?.role === 'artist') {
                  setActiveView('artist-dashboard');
                } else {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }
              }}
              className="hover:text-[#c98d48] transition-colors"
            >
              Artist Studio
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/admin');
                setIsAdminMode(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1 hover:text-[#c98d48] transition-colors text-[11px] font-mono text-[#8b7968]"
              title="Access Admin Management Panel"
            >
              <Shield className="w-3 h-3 text-[#c98d48]" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
