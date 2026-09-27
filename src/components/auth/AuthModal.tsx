import React, { useState } from 'react';
import {
  X,
  Palette,
  Compass,
  Upload,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { UserProfile, ArtistProfile, VerificationStatus } from '../../types';
import { geminiService } from '../../services/geminiService';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'artist' | 'explorer';
  onSuccess: (user: UserProfile, artist?: ArtistProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'explorer',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'select-role' | 'register-explorer' | 'register-artist'>(
    initialMode === 'login' ? 'login' : 'select-role'
  );

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Artist-Specific Fields
  const [stageName, setStageName] = useState('');
  const [artForm, setArtForm] = useState('Kathakali');
  const [location, setLocation] = useState('Kerala, India');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('10');
  const [phone, setPhone] = useState('');
  const [languagesInput, setLanguagesInput] = useState('English, Malayalam');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [traditionType, setTraditionType] = useState<'Traditional' | 'Contemporary' | 'Both'>('Traditional');
  const [docDescription, setDocDescription] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sign In Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = db.auth.signIn(email);
      if (!res) {
        throw new Error(
          'Account not found. Please verify your email or click "Create Account".'
        );
      }
      onSuccess(res.user, res.artist);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Explorer Registration Handler
  const handleRegisterExplorer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = db.auth.signUpExplorer(fullName, email, avatarUrl);
      confetti({ particleCount: 50, spread: 60 });
      onSuccess(newUser);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Artist Registration Handler (with Gemini verification)
  const handleRegisterArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setVerificationFeedback('Consulting Gemini Cultural Verification Engine...');

    try {
      // 1. Run Gemini AI Verification Check
      const verifyRes = await geminiService.verifyArtistAI({
        artistName: stageName || fullName,
        artForm,
        yearsExperience: Number(yearsExperience) || 0,
        location,
        bio,
        documentDescription: docDescription || 'Submitted performance certification / academy affiliation',
      });

      const languages = languagesInput
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      // 2. Register Artist in Database
      const { user, artist } = db.auth.signUpArtist(
        { fullName, email, avatarUrl },
        {
          artistName: stageName || fullName,
          artForm,
          location,
          bio,
          yearsExperience: Number(yearsExperience) || 0,
          phone,
          languages,
          portfolioUrl,
          traditionType,
          verificationStatus: verifyRes.status,
          verificationNotes: `${verifyRes.reason} (Confidence: ${verifyRes.confidence}%)`,
          documentUrl: docDescription,
        }
      );

      confetti({ particleCount: 60, spread: 70, colors: ['#c98d48', '#22c55e'] });
      onSuccess(user, artist);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Artist registration failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setVerificationFeedback(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#181412] border-2 border-[#4c3c2e] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#ede5d8] my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-[#27201b] border border-[#3e3227] text-[#baa794] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pb-4 border-b border-[#362b21] mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c98d48] to-[#7f4f1d] flex items-center justify-center mx-auto mb-2 border border-[#f0c88f]/40 shadow-lg">
            <span className="font-serif text-2xl font-bold text-[#14110e]">ॐ</span>
          </div>
          <h2 className="font-serif text-3xl text-[#f6eedf]">GanaKala Loka</h2>
          <p className="text-xs text-[#a69683]">
            Digital Sanctuary of Indian Arts, Ragas & Traditions
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. LOGIN VIEW */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[#baa894] mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artist@ganakalaloka.org or explorer@mail.com"
                className="w-full bg-[#221c18] border border-[#44362a] rounded-xl px-3.5 py-2.5 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#baa894] font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email.')}
                  className="text-[11px] text-[#c98d48] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#221c18] border border-[#44362a] rounded-xl px-3.5 py-2.5 text-[#ede5d8] focus:outline-none focus:border-[#c98d48] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#8e7e6e] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#c98d48] hover:bg-[#d89b56] disabled:opacity-50 text-[#120f0d] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98"
              >
                {isLoading ? 'Entering Codex...' : 'Login to GanaKala Loka'}
              </button>
            </div>

            {/* Quick Demo Switcher */}
            <div className="pt-3 border-t border-[#31261d] text-center">
              <p className="text-[11px] text-[#8e7e6e] mb-2">Quick Testing Account:</p>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo.artist@ganakalaloka.org');
                  setPassword('password123');
                }}
                className="text-[11px] text-[#c98d48] underline hover:text-[#e8b982]"
              >
                Fill Verified Master Artist Credentials
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-[#8e7e6e]">New to GanaKala Loka? </span>
              <button
                type="button"
                onClick={() => setMode('select-role')}
                className="text-[#c98d48] font-semibold hover:underline ml-1"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* 2. ROLE SELECTION VIEW */}
        {mode === 'select-role' && (
          <div className="space-y-6 text-center">
            <div>
              <h3 className="font-serif text-2xl text-[#f6eedf]">
                How would you like to use GanaKala Loka?
              </h3>
              <p className="text-xs text-[#a69683] mt-1">
                Choose your gateway into the living Indian arts community.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Option A: Artist */}
              <div
                onClick={() => setMode('register-artist')}
                className="p-5 rounded-2xl bg-[#221c18] border-2 border-[#433527] hover:border-[#c98d48] hover:bg-[#2b221d] transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#34271c] border border-[#c98d48]/40 flex items-center justify-center text-[#f0c88f] mb-3 group-hover:scale-110 transition-transform">
                  <Palette className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl text-[#f6eedf] group-hover:text-[#f0c88f]">
                  🎨 Cultural Artist
                </h4>
                <p className="text-xs text-[#b8a794] mt-1 leading-snug">
                  Showcase classical & folk performances, verify your lineage, and receive
                  direct appointment requests from patrons worldwide.
                </p>
              </div>

              {/* Option B: Explorer */}
              <div
                onClick={() => setMode('register-explorer')}
                className="p-5 rounded-2xl bg-[#221c18] border-2 border-[#433527] hover:border-[#c98d48] hover:bg-[#2b221d] transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#34271c] border border-[#c98d48]/40 flex items-center justify-center text-[#f0c88f] mb-3 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl text-[#f6eedf] group-hover:text-[#f0c88f]">
                  🔎 Cultural Explorer
                </h4>
                <p className="text-xs text-[#b8a794] mt-1 leading-snug">
                  Discover Indian heritage, ask GanaKala AI questions, save treasures,
                  and book appointments with verified masters.
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#baa894] hover:text-white"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}

        {/* 3. EXPLORER REGISTRATION */}
        {mode === 'register-explorer' && (
          <form onSubmit={handleRegisterExplorer} className="space-y-4 text-xs font-sans">
            <div className="text-center pb-2">
              <h3 className="font-serif text-2xl text-[#f6eedf]">
                Explorer Registration
              </h3>
              <p className="text-xs text-[#a69683]">
                Begin your journey of cultural discovery.
              </p>
            </div>

            <div>
              <label className="block text-[#baa894] mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-[#221c18] border border-[#44362a] rounded-xl px-3.5 py-2.5 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
              />
            </div>

            <div>
              <label className="block text-[#baa894] mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full bg-[#221c18] border border-[#44362a] rounded-xl px-3.5 py-2.5 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#baa894] mb-1 font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#221c18] border border-[#44362a] rounded-xl px-3.5 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#baa894] mb-1 font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full bg-[#221c18] border border-[#44362a] rounded-xl px-3.5 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#baa894] mb-1 font-medium">
                Profile Avatar URL (Optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#221c18] border border-[#44362a] rounded-xl px-3.5 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#c98d48] hover:bg-[#d89b56] disabled:opacity-50 text-[#120f0d] font-semibold text-sm rounded-xl transition-all shadow-md"
              >
                {isLoading ? 'Creating Profile...' : 'Complete Explorer Registration'}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('select-role')}
                className="text-xs text-[#baa894] hover:text-white"
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        {/* 4. ARTIST REGISTRATION (COMPREHENSIVE WITH GEMINI VERIFICATION) */}
        {mode === 'register-artist' && (
          <form onSubmit={handleRegisterArtist} className="space-y-4 text-xs font-sans max-h-[75vh] overflow-y-auto pr-1">
            <div className="text-center pb-2">
              <h3 className="font-serif text-2xl text-[#f6eedf]">
                Artist Accreditation & Registration
              </h3>
              <p className="text-xs text-[#a69683]">
                Register with Gemini-assisted credential verification.
              </p>
            </div>

            {verificationFeedback && (
              <div className="p-3 rounded-xl bg-amber-950/70 border border-[#c98d48] text-amber-200 text-xs flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#c98d48]" />
                <span>{verificationFeedback}</span>
              </div>
            )}

            {/* Account Details */}
            <div className="p-4 rounded-xl bg-[#201915] border border-[#3e3126] space-y-3">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#c98d48]">
                1. Account Credentials
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">Legal Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Vidushi Meera Krishnan"
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="meera@kalakshetra.org"
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>
            </div>

            {/* Artist Profile Details */}
            <div className="p-4 rounded-xl bg-[#201915] border border-[#3e3126] space-y-3">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#c98d48]">
                2. Cultural Lineage & Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">
                    Artist / Stage Name
                  </label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Meera Krishnan"
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">
                    Art Form / Discipline
                  </label>
                  <select
                    value={artForm}
                    onChange={(e) => setArtForm(e.target.value)}
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  >
                    <option value="Kathakali">Kathakali</option>
                    <option value="Yakshagana">Yakshagana</option>
                    <option value="Bharatanatyam">Bharatanatyam</option>
                    <option value="Carnatic Music">Carnatic Music (Vocal / Veena / Flute)</option>
                    <option value="Kuchipudi">Kuchipudi</option>
                    <option value="Hindustani Classical">Hindustani Classical (Sitar / Vocal)</option>
                    <option value="Odissi">Odissi</option>
                    <option value="Kalaripayattu">Kalaripayattu</option>
                    <option value="Madhubani & Mithila Painting">Madhubani & Mithila Painting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Chennai, Tamil Nadu"
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">
                    Years of Rigorous Practice
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="70"
                    required
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#baa894] mb-1 font-medium">
                  Short Bio & Guru Parampara
                </label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Disciple of Guru..., trained in the Thanjavur Margam tradition. Soloist and teacher for 12 years."
                  className="w-full bg-[#181310] border border-[#44362a] rounded-lg p-3 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">
                    Languages (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    placeholder="Tamil, English, Sanskrit"
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">
                    Tradition Orientation
                  </label>
                  <select
                    value={traditionType}
                    onChange={(e) =>
                      setTraditionType(e.target.value as 'Traditional' | 'Contemporary' | 'Both')
                    }
                    className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  >
                    <option value="Traditional">Traditional (Sampradaya)</option>
                    <option value="Contemporary">Contemporary Innovation</option>
                    <option value="Both">Both (Traditional Core & Contemporary)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#baa894] mb-1 font-medium">
                  Portfolio / Social Links (Optional)
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#181310] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>
            </div>

            {/* Verification Proof Section */}
            <div className="p-4 rounded-xl bg-[#201915] border border-[#3e3126] space-y-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#c98d48]" />
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#c98d48]">
                  3. Lineage & Certificate Verification Proof
                </h4>
              </div>
              <p className="text-[11px] text-[#baa894] leading-snug">
                Provide details or citation of your academy diploma, Sangeet Natak Akademi fellowship,
                temple trust recognition, or guru recommendation letter. Gemini analyzes this during sign-up.
              </p>

              <div>
                <textarea
                  rows={2}
                  required
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="e.g. Kalakshetra 5-Year Diploma in Bharatanatyam (Roll No: 2017-B-42), Sangeet Natak Akademi Bismillah Khan Awardee."
                  className="w-full bg-[#181310] border border-[#44362a] rounded-lg p-2.5 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#c98d48] hover:bg-[#d89b56] disabled:opacity-50 text-[#120f0d] font-semibold text-sm rounded-xl transition-all shadow-md"
              >
                {isLoading ? 'Verifying with Gemini...' : 'Verify Credentials & Complete Registration'}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('select-role')}
                className="text-xs text-[#baa894] hover:text-white"
              >
                ← Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
