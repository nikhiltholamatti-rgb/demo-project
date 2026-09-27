import { supabase } from './supabase';

export interface AdminSession {
  userId: string;
  email: string;
  token?: string;
  authenticatedAt: string;
  isSuperAdmin: boolean;
}

const ADMIN_SESSION_KEY = 'ganakala_admin_session';
const ADMIN_USERS_CACHE_KEY = 'ganakala_admin_users_cache';

export const adminAuth = {
  /**
   * Retrieves active admin session from localStorage
   */
  getSession(): AdminSession | null {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Sets current admin session
   */
  setSession(session: AdminSession | null): void {
    if (session) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    window.dispatchEvent(new Event('ganakala_admin_auth_changed'));
  },

  /**
   * Check if user UUID exists in admin_users table in Supabase
   */
  async verifyAdminUser(userId: string): Promise<boolean> {
    try {
      // 1. Check local authorized cache
      const localAdmins: string[] = JSON.parse(
        localStorage.getItem(ADMIN_USERS_CACHE_KEY) || '[]'
      );
      if (localAdmins.includes(userId)) {
        return true;
      }

      // 2. Query remote Supabase admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data && data.user_id === userId) {
        // Cache valid admin user
        if (!localAdmins.includes(userId)) {
          localAdmins.push(userId);
          localStorage.setItem(ADMIN_USERS_CACHE_KEY, JSON.stringify(localAdmins));
        }
        return true;
      }

      return false;
    } catch (err) {
      console.warn('[AdminAuth] Error verifying admin user in Supabase:', err);
      // Fallback check in local admin cache
      const localAdmins: string[] = JSON.parse(
        localStorage.getItem(ADMIN_USERS_CACHE_KEY) || '[]'
      );
      return localAdmins.includes(userId);
    }
  },

  /**
   * Signs in Admin via Supabase Auth and validates against admin_users table
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; session?: AdminSession; error?: string; userId?: string }> {
    try {
      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || 'Invalid email or password.',
        };
      }

      const userId = authData.user.id;

      // Step 2: Check UUID in admin_users table
      const isAdmin = await this.verifyAdminUser(userId);

      if (!isAdmin) {
        // Deny access and sign out of Supabase auth
        await supabase.auth.signOut();
        this.setSession(null);
        return {
          success: false,
          userId,
          error: `Access Denied: Your account UUID (${userId}) is not present in the admin_users table.`,
        };
      }

      // Authorized admin session
      const session: AdminSession = {
        userId,
        email: authData.user.email || email,
        token: authData.session?.access_token,
        authenticatedAt: new Date().toISOString(),
        isSuperAdmin: true,
      };

      this.setSession(session);
      return { success: true, session, userId };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'An unexpected error occurred during admin authentication.',
      };
    }
  },

  /**
   * Demo / Fast-Track Admin Login for evaluation & demonstrations
   */
  grantAdminAccess(userId: string, email: string): AdminSession {
    const localAdmins: string[] = JSON.parse(
      localStorage.getItem(ADMIN_USERS_CACHE_KEY) || '[]'
    );
    if (!localAdmins.includes(userId)) {
      localAdmins.push(userId);
      localStorage.setItem(ADMIN_USERS_CACHE_KEY, JSON.stringify(localAdmins));
    }

    // Also attempt inserting into Supabase admin_users table
    supabase.from('admin_users').insert([{ user_id: userId }]).then(({ error }) => {
      if (!error) console.log('[AdminAuth] Added user to Supabase admin_users table:', userId);
    });

    const session: AdminSession = {
      userId,
      email,
      authenticatedAt: new Date().toISOString(),
      isSuperAdmin: true,
    };

    this.setSession(session);
    return session;
  },

  /**
   * Signs out the current admin
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    this.setSession(null);
  },
};
