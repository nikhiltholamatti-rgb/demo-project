import React, { useState } from 'react';
import {
  Compass,
  Palette,
  Search,
  Bell,
  Calendar,
  LogOut,
  User,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  Database,
} from 'lucide-react';
import { UserProfile, ArtistProfile, NotificationItem } from '../../types';
import { SupabaseStatusModal } from './SupabaseStatusModal';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentArtist: ArtistProfile | null;
  activeView: 'sketchbook' | 'explorer' | 'artist-dashboard' | 'culture-detail' | 'artist-profile';
  onNavigate: (view: 'sketchbook' | 'explorer' | 'artist-dashboard') => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenAppointments: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSignOut: () => void;
  onOpenAdmin?: () => void;
  notifications: NotificationItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentArtist,
  activeView,
  onNavigate,
  onOpenSearch,
  onOpenNotifications,
  onOpenAppointments,
  onOpenAuth,
  onSignOut,
  onOpenAdmin,
  notifications,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#161210]/95 backdrop-blur-md border-b border-[#3b2f24] px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Platform Name */}
        <div
          onClick={() => onNavigate('sketchbook')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c98d48] to-[#7f4f1d] flex items-center justify-center shadow-lg border border-[#f0c88f]/40 group-hover:scale-105 transition-transform">
            <span className="font-serif text-lg font-bold text-[#14110e]">ॐ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#f6eedf]">
                GanaKala Loka
              </span>
            </div>
            <span className="text-[10px] text-[#caa578] font-mono tracking-wider hidden sm:block">
              Living Digital Indian Arts Codex
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-sans">
          <button
            onClick={() => onNavigate('sketchbook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'sketchbook'
                ? 'bg-[#2b221a] text-[#f0c88f] border border-[#c98d48]/50'
                : 'text-[#baa894] hover:text-white hover:bg-[#201915]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#c98d48]" />
            <span>Sketchbook</span>
          </button>

          <button
            onClick={() => onNavigate('explorer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'explorer' || activeView === 'culture-detail'
                ? 'bg-[#2b221a] text-[#f0c88f] border border-[#c98d48]/50'
                : 'text-[#baa894] hover:text-white hover:bg-[#201915]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#c98d48]" />
            <span>Explore Culture</span>
          </button>

          {currentUser?.role === 'artist' && currentArtist && (
            <button
              onClick={() => onNavigate('artist-dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'artist-dashboard'
                  ? 'bg-[#2b221a] text-[#f0c88f] border border-[#c98d48]/50'
                  : 'text-[#baa894] hover:text-white hover:bg-[#201915]'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#c98d48]" />
              <span>Artist Studio</span>
            </button>
          )}
        </nav>

        {/* Right Tools & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Connection Status Badge */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-mono transition-all"
            title="Connected to Supabase project: uegznkmvmaqstwvujfnx"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[11px]">Supabase</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#201915] border border-[#3f3226] hover:border-[#c98d48] text-[#a99986] text-xs font-sans transition-all"
            title="Search Indian cultures, ragas, artists, videos"
          >
            <Search className="w-3.5 h-3.5 text-[#c98d48]" />
            <span className="hidden sm:inline">Search Codex</span>
          </button>

          {/* Notifications Bell */}
          {currentUser && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-[#201915] border border-[#3f3226] text-[#baa794] hover:text-white hover:border-[#c98d48] transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c98d48] text-[#120f0d] font-mono text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile or Login CTA */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#221c18] border border-[#44362a] hover:border-[#c98d48] transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#36271c] border border-[#c98d48]/50 flex items-center justify-center font-serif text-xs text-[#f0c88f]">
                  {currentUser.fullName[0]}
                </div>
                <span className="text-xs text-[#ede5d8] font-medium hidden sm:inline truncate max-w-[120px]">
                  {currentUser.fullName}
                </span>
                <ChevronDown className="w-3 h-3 text-[#baa794]" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1a1613] border-2 border-[#433527] p-2 shadow-2xl z-50 text-xs font-sans space-y-1">
                  <div className="px-3 py-2 border-b border-[#31251c]">
                    <p className="font-semibold text-[#f5ebd7] truncate">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-[#c98d48] capitalize">
                      {currentUser.role} Account
                    </p>
                  </div>

                  {currentUser.role === 'artist' && currentArtist ? (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('artist-dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#d8c8b5] hover:bg-[#251e18] hover:text-white"
                      >
                        <Palette className="w-3.5 h-3.5 text-[#c98d48]" />
                        <span>Artist Studio</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('explorer');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#d8c8b5] hover:bg-[#251e18] hover:text-white"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#c98d48]" />
                        <span>Switch to Explorer</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        onNavigate('explorer');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#d8c8b5] hover:bg-[#251e18] hover:text-white"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#c98d48]" />
                      <span>Explorer Feed</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenAppointments();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#d8c8b5] hover:bg-[#251e18] hover:text-white"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#c98d48]" />
                    <span>My Appointments</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSupabaseModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-400 hover:bg-[#251e18]"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Supabase Database</span>
                  </button>

                  {onOpenAdmin && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#f2cb97] hover:bg-[#251e18]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c98d48]" />
                      <span>Admin Codex Panel</span>
                    </button>
                  )}

                  <div className="border-t border-[#31251c] pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-[#291b19]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-sans">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-[#baa894] hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 rounded-lg bg-[#c98d48] hover:bg-[#d89b56] text-[#120f0d] font-semibold transition-all shadow"
              >
                Join
              </button>
            </div>
          )}
        </div>
      </div>

      {isSupabaseModalOpen && (
        <SupabaseStatusModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      )}
    </header>
  );
};
