import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Landmark,
  Palette,
  Image as ImageIcon,
  Calendar,
  Film,
  Settings,
  BookOpen,
  LogOut,
  ExternalLink,
  Shield,
  Database,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { AdminSession, adminAuth } from '../../lib/adminAuth';

export type AdminView =
  | 'dashboard'
  | 'bookings'
  | 'cultures'
  | 'culture-new'
  | 'culture-edit'
  | 'sketchbook'
  | 'artists'
  | 'artworks'
  | 'events'
  | 'media'
  | 'settings';

interface AdminLayoutProps {
  currentView: AdminView;
  onNavigate: (view: AdminView, param?: string) => void;
  onOpenPublicSite: () => void;
  adminSession: AdminSession | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenPublicSite,
  adminSession,
  onLogout,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings' as AdminView, label: 'Bookings', icon: CalendarCheck },
    { id: 'cultures' as AdminView, label: 'Cultures', icon: Landmark },
    { id: 'sketchbook' as AdminView, label: 'Sketchbook Plates', icon: BookOpen },
    { id: 'artists' as AdminView, label: 'Artists', icon: Palette },
    { id: 'artworks' as AdminView, label: 'Artworks', icon: ImageIcon },
    { id: 'events' as AdminView, label: 'Events', icon: Calendar },
    { id: 'media' as AdminView, label: 'Media', icon: Film },
    { id: 'settings' as AdminView, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: AdminView) => {
    onNavigate(view);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#110e0c] text-[#ede6d8] flex font-sans">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#161210] border-r border-[#3a2e24] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#31251d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c98d48] to-[#804f1e] flex items-center justify-center shadow-lg border border-[#f0c88f]/40">
              <span className="font-serif text-lg font-bold text-[#14110e]">ॐ</span>
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#f8ede0] tracking-wide leading-none">
                GanaKala Loka
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#caa578]">
                Admin Codex Panel
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#baa794] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Connection Status Bar */}
        <div className="px-5 py-2.5 bg-[#1f1814] border-b border-[#31251d] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supabase Connected</span>
          </div>
          <span className="text-[#a4917d] truncate text-[10px]">uegznkmvma...</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'cultures' &&
                ['culture-new', 'culture-edit', 'sketchbook'].includes(currentView));

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#292019] text-[#f2cc96] border border-[#c98d48]/50 shadow-md font-semibold'
                    : 'text-[#baa692] hover:bg-[#201915] hover:text-[#f5ebd7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#c98d48]' : 'text-[#8b7968]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#c98d48]" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Info & Logout */}
        <div className="p-3 border-t border-[#31251d] space-y-2">
          {adminSession && (
            <div className="p-2.5 rounded-xl bg-[#1e1713] border border-[#372a20] text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-emerald-300 font-semibold uppercase">
                  Verified Admin
                </span>
              </div>
              <p className="text-[11px] text-[#baa794] truncate" title={adminSession.email}>
                {adminSession.email}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenPublicSite}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#251e18] hover:bg-[#342a22] text-[#d6c7b4] text-[11px] border border-[#44352a] transition-colors"
              title="Open Public GanaKala Loka Website"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3 text-[#c98d48]" />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#2b1816] hover:bg-[#3a201d] text-rose-300 text-[11px] border border-rose-900/40 transition-colors"
              title="Sign Out of Admin Panel"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#161210]/95 backdrop-blur-md border-b border-[#3b2e24] px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#241c17] border border-[#44352a] text-[#baa794] hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#c98d48]">
                  Administration
                </span>
                <span className="text-[#645242]">/</span>
                <span className="text-xs text-[#f5ebd7] font-semibold capitalize">
                  {currentView.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPublicSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241d18] hover:bg-[#342921] border border-[#44362b] text-[#f2cb97] text-xs font-medium transition-all"
            >
              <span>Back to Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
