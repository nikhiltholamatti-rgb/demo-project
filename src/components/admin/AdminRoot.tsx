import React, { useState, useEffect } from 'react';
import { adminAuth, AdminSession } from '../../lib/adminAuth';
import { AdminLayout, AdminView } from './AdminLayout';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminBookings } from './AdminBookings';
import { AdminCultures } from './AdminCultures';
import { AdminCultureForm } from './AdminCultureForm';
import { AdminArtists } from './AdminArtists';
import { AdminArtworks } from './AdminArtworks';
import { AdminEvents } from './AdminEvents';
import { AdminMedia } from './AdminMedia';
import { AdminSettings } from './AdminSettings';
import { AdminSketchbook } from './AdminSketchbook';
import { Culture } from '../../types';

interface AdminRootProps {
  onBackToPublicSite: () => void;
  onOpenPublicCulture?: (slug: string) => void;
}

export const AdminRoot: React.FC<AdminRootProps> = ({
  onBackToPublicSite,
  onOpenPublicCulture,
}) => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() =>
    adminAuth.getSession()
  );
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [selectedCultureId, setSelectedCultureId] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync state with URL pathname
  const parsePathname = () => {
    const path = window.location.pathname;

    if (path === '/admin/login') {
      return { isLogin: true, view: 'dashboard' as AdminView };
    }

    if (path.startsWith('/admin/cultures/new')) {
      return { isLogin: false, view: 'culture-new' as AdminView };
    }

    if (path.startsWith('/admin/cultures/edit/')) {
      const parts = path.split('/admin/cultures/edit/');
      const cid = parts[1];
      setSelectedCultureId(cid);
      return { isLogin: false, view: 'culture-edit' as AdminView, id: cid };
    }

    if (path.startsWith('/admin/bookings')) {
      return { isLogin: false, view: 'bookings' as AdminView };
    }

    if (path.startsWith('/admin/cultures')) {
      return { isLogin: false, view: 'cultures' as AdminView };
    }

    if (path.startsWith('/admin/sketchbook')) {
      return { isLogin: false, view: 'sketchbook' as AdminView };
    }

    if (path.startsWith('/admin/artists')) {
      return { isLogin: false, view: 'artists' as AdminView };
    }

    if (path.startsWith('/admin/artworks')) {
      return { isLogin: false, view: 'artworks' as AdminView };
    }

    if (path.startsWith('/admin/events')) {
      return { isLogin: false, view: 'events' as AdminView };
    }

    if (path.startsWith('/admin/media')) {
      return { isLogin: false, view: 'media' as AdminView };
    }

    if (path.startsWith('/admin/settings')) {
      return { isLogin: false, view: 'settings' as AdminView };
    }

    return { isLogin: false, view: 'dashboard' as AdminView };
  };

  const [isLoginPage, setIsLoginPage] = useState(() => {
    return window.location.pathname === '/admin/login';
  });

  useEffect(() => {
    const { isLogin, view, id } = parsePathname();
    setIsLoginPage(isLogin);
    setCurrentView(view);
    if (id) setSelectedCultureId(id);

    const handlePopState = () => {
      const parsed = parsePathname();
      setIsLoginPage(parsed.isLogin);
      setCurrentView(parsed.view);
      if (parsed.id) setSelectedCultureId(parsed.id);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL history and view
  const navigateTo = (view: AdminView, param?: string) => {
    setCurrentView(view);
    let targetPath = '/admin';

    if (view === 'dashboard') targetPath = '/admin';
    else if (view === 'bookings') targetPath = '/admin/bookings';
    else if (view === 'cultures') targetPath = '/admin/cultures';
    else if (view === 'culture-new') targetPath = '/admin/cultures/new';
    else if (view === 'culture-edit') {
      setSelectedCultureId(param);
      targetPath = param ? `/admin/cultures/edit/${param}` : '/admin/cultures';
    } else if (view === 'sketchbook') targetPath = '/admin/sketchbook';
    else if (view === 'artists') targetPath = '/admin/artists';
    else if (view === 'artworks') targetPath = '/admin/artworks';
    else if (view === 'events') targetPath = '/admin/events';
    else if (view === 'media') targetPath = '/admin/media';
    else if (view === 'settings') targetPath = '/admin/settings';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    setIsLoginPage(false);
    window.history.pushState({}, '', '/admin');
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await adminAuth.signOut();
    setAdminSession(null);
    setIsLoginPage(true);
    window.history.pushState({}, '', '/admin/login');
  };

  // If user requested /admin/login explicitly
  if (isLoginPage) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToPublicSite={() => {
          window.history.pushState({}, '', '/');
          onBackToPublicSite();
        }}
      />
    );
  }

  // If user is not logged in as admin, require login
  if (!adminSession) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToPublicSite={() => {
          window.history.pushState({}, '', '/');
          onBackToPublicSite();
        }}
      />
    );
  }

  // Render Admin Layout with selected view
  return (
    <AdminLayout
      currentView={currentView}
      onNavigate={navigateTo}
      onOpenPublicSite={() => {
        window.history.pushState({}, '', '/');
        onBackToPublicSite();
      }}
      adminSession={adminSession}
      onLogout={handleLogout}
    >
      {currentView === 'dashboard' && (
        <AdminDashboard onNavigate={navigateTo} />
      )}

      {currentView === 'bookings' && <AdminBookings />}

      {currentView === 'cultures' && (
        <AdminCultures
          onNavigate={navigateTo}
          onOpenPublicCulture={(slug) => {
            if (onOpenPublicCulture) {
              window.history.pushState({}, '', `/`);
              onOpenPublicCulture(slug);
            }
          }}
        />
      )}

      {currentView === 'culture-new' && (
        <AdminCultureForm
          onNavigate={navigateTo}
          onSaved={() => navigateTo('cultures')}
        />
      )}

      {currentView === 'culture-edit' && (
        <AdminCultureForm
          cultureId={selectedCultureId}
          onNavigate={navigateTo}
          onSaved={() => navigateTo('cultures')}
        />
      )}

      {currentView === 'sketchbook' && <AdminSketchbook />}

      {currentView === 'artists' && <AdminArtists />}

      {currentView === 'artworks' && <AdminArtworks />}

      {currentView === 'events' && <AdminEvents />}

      {currentView === 'media' && <AdminMedia />}

      {currentView === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
