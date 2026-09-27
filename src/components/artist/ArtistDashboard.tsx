import React, { useState, useEffect } from 'react';
import {
  Upload,
  Video as VideoIcon,
  Image as ImageIcon,
  Award,
  Calendar,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  MapPin,
  Trash2,
  Sparkles,
  RefreshCw,
  Eye,
  PlusCircle,
  FolderOpen,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import {
  ArtistProfile,
  UserProfile,
  Culture,
  Artwork,
  Video,
  Achievement,
  Post,
  Appointment,
  VerificationStatus,
} from '../../types';
import { geminiService } from '../../services/geminiService';
import confetti from 'canvas-confetti';

interface ArtistDashboardProps {
  currentUser: UserProfile;
  artist: ArtistProfile;
  onSwitchToExplorer: () => void;
  onViewPublicProfile: (artistId: string) => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({
  currentUser,
  artist: initialArtist,
  onSwitchToExplorer,
  onViewPublicProfile,
}) => {
  const [artist, setArtist] = useState<ArtistProfile>(initialArtist);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'upload' | 'arts' | 'videos' | 'achievements' | 'posts' | 'appointments' | 'verification'
  >('overview');

  const [cultures, setCultures] = useState<Culture[]>([]);
  const [myArtworks, setMyArtworks] = useState<Artwork[]>([]);
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [myAchievements, setMyAchievements] = useState<Achievement[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Content Upload Form State
  const [uploadType, setUploadType] = useState<'video' | 'artwork' | 'achievement' | 'post'>('video');
  const [selectedCultureId, setSelectedCultureId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [locationInput, setLocationInput] = useState(artist.location || '');
  const [durationInput, setDurationInput] = useState('08:45');
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);

  // Re-verification state
  const [reverifyDocDesc, setReverifyDocDesc] = useState('');
  const [isReverifying, setIsReverifying] = useState(false);

  const reloadData = () => {
    const updatedArtist = db.artists.getById(artist.id) || artist;
    setArtist(updatedArtist);
    setCultures(db.cultures.getAll());
    setMyArtworks(db.artworks.getByArtist(artist.id));
    setMyVideos(db.videos.getByArtist(artist.id));
    setMyAchievements(db.achievements.getByArtist(artist.id));
    setMyPosts(db.posts.getByArtist(artist.id));
    setMyAppointments(db.appointments.getForArtist(artist.id));
  };

  useEffect(() => {
    reloadData();
    if (cultures.length > 0 && !selectedCultureId) {
      const match = cultures.find((c) =>
        c.name.toLowerCase().includes(artist.artForm.toLowerCase())
      );
      setSelectedCultureId(match ? match.id : cultures[0].id);
    }
  }, [artist.id]);

  // Appointment Status Updates (Confirm / Decline)
  const handleUpdateAppointment = (
    appointmentId: string,
    newStatus: 'Confirmed' | 'Declined'
  ) => {
    db.appointments.updateStatus(appointmentId, newStatus);
    if (newStatus === 'Confirmed') {
      confetti({
        particleCount: 40,
        spread: 50,
        colors: ['#c98d48', '#22c55e', '#ffffff'],
      });
    }
    reloadData();
  };

  // Upload Content Form Handler
  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmittingContent) return;

    setIsSubmittingContent(true);
    const selectedCulture = cultures.find((c) => c.id === selectedCultureId) || cultures[0];
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (uploadType === 'video') {
        db.videos.create({
          artistId: artist.id,
          artistName: artist.artistName,
          artistAvatar: currentUser.avatarUrl,
          cultureId: selectedCulture.id,
          cultureName: selectedCulture.name,
          title,
          description,
          videoUrl:
            mediaUrl ||
            'https://assets.mixkit.co/videos/preview/mixkit-hands-dancing-with-classical-indian-bells-41489-large.mp4',
          thumbnailUrl:
            thumbnailUrl ||
            selectedCulture.imagePlate ||
            'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
          duration: durationInput || '10:00',
          tags: tags.length > 0 ? tags : [artist.artForm, selectedCulture.name],
        });
      } else if (uploadType === 'artwork') {
        db.artworks.create({
          artistId: artist.id,
          artistName: artist.artistName,
          artistAvatar: currentUser.avatarUrl,
          cultureId: selectedCulture.id,
          cultureName: selectedCulture.name,
          title,
          description,
          mediaUrl:
            mediaUrl ||
            selectedCulture.imagePlate ||
            'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80',
          location: locationInput || artist.location,
          tags: tags.length > 0 ? tags : [artist.artForm, selectedCulture.name],
        });
      } else if (uploadType === 'achievement') {
        db.achievements.create({
          artistId: artist.id,
          title,
          organization: locationInput || 'Sangeet Natak Akademi / Cultural Trust',
          year: new Date().getFullYear().toString(),
          description,
          badgeType: 'National Award',
        });
      } else if (uploadType === 'post') {
        db.posts.create({
          artistId: artist.id,
          artistName: artist.artistName,
          artistAvatar: currentUser.avatarUrl,
          cultureId: selectedCulture.id,
          cultureName: selectedCulture.name,
          title,
          content: description,
          mediaUrl: mediaUrl || undefined,
          tags: tags.length > 0 ? tags : [artist.artForm],
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setThumbnailUrl('');
      setTagsInput('');
      reloadData();
      setActiveTab(uploadType === 'video' ? 'videos' : uploadType === 'artwork' ? 'arts' : 'overview');

      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#c98d48', '#f5ebd7'],
      });
    } catch (err) {
      console.error(err);
      alert('Failed to publish content');
    } finally {
      setIsSubmittingContent(false);
    }
  };

  // Re-run Gemini AI Verification
  const handleTriggerReverification = async () => {
    if (!reverifyDocDesc.trim() || isReverifying) return;
    setIsReverifying(true);

    try {
      const res = await geminiService.verifyArtistAI({
        artistName: artist.artistName,
        artForm: artist.artForm,
        yearsExperience: artist.yearsExperience,
        location: artist.location,
        bio: artist.bio,
        documentDescription: reverifyDocDesc,
      });

      const updated = db.artists.update(artist.id, {
        verificationStatus: res.status,
        verificationNotes: `${res.reason} (Confidence: ${res.confidence}%)`,
      });

      setArtist(updated);
      setReverifyDocDesc('');
      alert(`Verification analysis completed: ${res.status}`);
    } catch (err) {
      console.error(err);
      alert('Verification analysis failed.');
    } finally {
      setIsReverifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#110f0e] text-[#ede5d8] pb-24 font-body">
      {/* Top Banner Navigation */}
      <div className="border-b border-[#3b3024] bg-[#16120f]/95 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c98d48] to-[#804f1e] flex items-center justify-center font-serif text-2xl font-bold text-[#14110e] shadow-lg border border-[#f5d098]/30">
              {artist.artistName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl text-[#f6eedf]">
                  {artist.artistName}
                </h1>
                {artist.verificationStatus === 'Verified' ? (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full font-sans">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Practitioner
                  </span>
                ) : (
                  <span className="text-[11px] bg-amber-950 text-amber-400 border border-amber-500/50 px-2 py-0.5 rounded-full font-sans">
                    {artist.verificationStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a69581]">
                {artist.artForm} • {artist.location} • {artist.yearsExperience} yrs exp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewPublicProfile(artist.id)}
              className="px-3.5 py-1.5 rounded-lg bg-[#241d17] hover:bg-[#31271f] text-[#d6c7b3] border border-[#433527] text-xs font-sans flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-[#c98d48]" />
              <span>Public Profile</span>
            </button>

            <button
              onClick={onSwitchToExplorer}
              className="px-3.5 py-1.5 rounded-lg bg-[#c98d48] hover:bg-[#d89b56] text-[#13100e] font-semibold text-xs font-sans transition-all"
            >
              Explore as Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Verification Status Banner if Not Verified */}
      {artist.verificationStatus !== 'Verified' && (
        <div className="bg-amber-950/40 border-b border-amber-700/40 px-4 sm:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Verification Status: {artist.verificationStatus}.</strong>{' '}
                {artist.verificationNotes || 'Awaiting credential review.'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('verification')}
              className="underline text-[#f0c88f] hover:text-white"
            >
              Review or Resubmit Proof
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-2 font-sans text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                : 'bg-[#181411] text-[#baa794] hover:bg-[#251f1a]'
            }`}
          >
            <span>Studio Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                : 'bg-[#181411] text-[#baa794] hover:bg-[#251f1a]'
            }`}
          >
            <span className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Content</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'appointments'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                : 'bg-[#181411] text-[#baa794] hover:bg-[#251f1a]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </span>
            {myAppointments.filter((a) => a.status === 'Pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] flex items-center justify-center">
                {myAppointments.filter((a) => a.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'videos'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                : 'bg-[#181411] text-[#baa794] hover:bg-[#251f1a]'
            }`}
          >
            <span>My Videos ({myVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('arts')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'arts'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                : 'bg-[#181411] text-[#baa794] hover:bg-[#251f1a]'
            }`}
          >
            <span>Artworks & Visuals ({myArtworks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'achievements'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                : 'bg-[#181411] text-[#baa794] hover:bg-[#251f1a]'
            }`}
          >
            <span>Achievements ({myAchievements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'verification'
                ? 'bg-[#c98d48] text-[#120f0d] font-semibold shadow'
                : 'bg-[#181411] text-[#baa794] hover:bg-[#251f1a]'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Verification Status</span>
            </span>
          </button>
        </div>

        {/* Content Area (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#171310] border border-[#3e3126] text-center">
                  <div className="text-2xl font-serif text-[#f6ebd9]">
                    {myVideos.length}
                  </div>
                  <div className="text-xs text-[#baa894] font-sans">
                    Performance Videos
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171310] border border-[#3e3126] text-center">
                  <div className="text-2xl font-serif text-[#f6ebd9]">
                    {myArtworks.length}
                  </div>
                  <div className="text-xs text-[#baa894] font-sans">
                    Cataloged Artworks
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171310] border border-[#3e3126] text-center">
                  <div className="text-2xl font-serif text-[#f6ebd9]">
                    {myAppointments.length}
                  </div>
                  <div className="text-xs text-[#baa894] font-sans">
                    Consultations
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#171310] border border-[#3e3126] text-center">
                  <div className="text-2xl font-serif text-[#f6ebd9]">
                    {myAchievements.length}
                  </div>
                  <div className="text-xs text-[#baa894] font-sans">Honors</div>
                </div>
              </div>

              {/* Pending Appointments Card */}
              {myAppointments.filter((a) => a.status === 'Pending').length > 0 && (
                <div className="p-6 rounded-2xl bg-[#231a14] border-2 border-[#c98d48]/50 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#c98d48]" />
                      <h3 className="font-serif text-xl text-[#f6ebd9]">
                        New Appointment Requests Awaiting Response
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {myAppointments
                      .filter((a) => a.status === 'Pending')
                      .map((appt) => (
                        <div
                          key={appt.id}
                          className="p-4 rounded-xl bg-[#181310] border border-[#44362a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#f5ebd7]">
                                {appt.explorerName}
                              </span>
                              <span className="text-[#baa894]">({appt.explorerEmail})</span>
                            </div>
                            <p className="text-[#c98d48] font-medium mt-0.5">
                              {appt.purpose}
                            </p>
                            <div className="text-[#8e7e6e] mt-1">
                              Date: <strong>{appt.date}</strong> at <strong>{appt.time}</strong>
                            </div>
                            {appt.notes && (
                              <p className="text-[#baa894] italic mt-1 font-body">
                                "{appt.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateAppointment(appt.id, 'Confirmed')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 font-medium transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateAppointment(appt.id, 'Declined')}
                              className="px-3.5 py-1.5 bg-[#2d221a] hover:bg-[#3d2f25] text-rose-300 rounded-lg flex items-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Bio & Heritage Narrative */}
              <div className="p-6 rounded-2xl bg-[#171310] border border-[#3e3126] space-y-3">
                <h3 className="font-serif text-xl text-[#f6ebd9]">
                  Artist Dossier Summary
                </h3>
                <p className="text-sm text-[#ded3c3] leading-relaxed font-body">
                  {artist.bio}
                </p>
                <div className="text-xs text-[#a99784] font-sans pt-2 border-t border-[#2e2319] flex flex-wrap gap-4">
                  <span>Tradition: <strong>{artist.traditionType}</strong></span>
                  <span>Years of Sadhana: <strong>{artist.yearsExperience}</strong></span>
                  <span>Languages: <strong>{artist.languages?.join(', ')}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PUBLISH NEW CONTENT */}
          {activeTab === 'upload' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#171310] border-2 border-[#44362a] shadow-xl space-y-6">
              <div>
                <h3 className="font-serif text-2xl text-[#f6ebd9]">
                  Publish Cultural Content
                </h3>
                <p className="text-xs text-[#baa794]">
                  Upload artworks, classical videos, achievements, or scholarly reflections.
                  Content is cataloged directly into the corresponding culture archive.
                </p>
              </div>

              {/* Select content type */}
              <div className="grid grid-cols-4 gap-2 text-xs font-sans">
                <button
                  type="button"
                  onClick={() => setUploadType('video')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    uploadType === 'video'
                      ? 'bg-[#c98d48] text-[#120f0d] font-semibold border-[#f0c88f]'
                      : 'bg-[#221c17] border-[#3e3227] text-[#baa794] hover:bg-[#2b231c]'
                  }`}
                >
                  <VideoIcon className="w-4 h-4" />
                  <span>Performance Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadType('artwork')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    uploadType === 'artwork'
                      ? 'bg-[#c98d48] text-[#120f0d] font-semibold border-[#f0c88f]'
                      : 'bg-[#221c17] border-[#3e3227] text-[#baa794] hover:bg-[#2b231c]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Artwork / Artifact</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadType('achievement')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    uploadType === 'achievement'
                      ? 'bg-[#c98d48] text-[#120f0d] font-semibold border-[#f0c88f]'
                      : 'bg-[#221c17] border-[#3e3227] text-[#baa794] hover:bg-[#2b231c]'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Achievement / Honor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadType('post')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    uploadType === 'post'
                      ? 'bg-[#c98d48] text-[#120f0d] font-semibold border-[#f0c88f]'
                      : 'bg-[#221c17] border-[#3e3227] text-[#baa794] hover:bg-[#2b231c]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Cultural Post</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateContent} className="space-y-4 text-xs font-sans">
                {/* Culture Selection */}
                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">
                    Associated Culture / Art Form (Crucial: Appears on that Culture Page!)
                  </label>
                  <select
                    value={selectedCultureId}
                    onChange={(e) => setSelectedCultureId(e.target.value)}
                    className="w-full bg-[#221c18] border border-[#44362a] rounded-lg px-3 py-2.5 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  >
                    {cultures.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kathakali Duryodhana Vadham Performance or Saraswati Veena Todi Alapana"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#221c18] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div>
                  <label className="block text-[#baa894] mb-1 font-medium">
                    Description / Scholarly Context
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the composition, raga, mudra, aharya details, or cultural context..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#221c18] border border-[#44362a] rounded-lg p-3 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#baa894] mb-1 font-medium">
                      Media URL (Video / Image)
                    </label>
                    <input
                      type="url"
                      placeholder="https://... (or leave blank for demo asset)"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-[#221c18] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#baa894] mb-1 font-medium">
                      Thumbnail Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://... (preview poster)"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full bg-[#221c18] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#baa894] mb-1 font-medium">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Kathakali, Abhinaya, Paccha, Kalivilakku"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full bg-[#221c18] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                    />
                  </div>

                  {uploadType === 'video' ? (
                    <div>
                      <label className="block text-[#baa894] mb-1 font-medium">
                        Duration (mm:ss)
                      </label>
                      <input
                        type="text"
                        placeholder="12:30"
                        value={durationInput}
                        onChange={(e) => setDurationInput(e.target.value)}
                        className="w-full bg-[#221c18] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[#baa894] mb-1 font-medium">
                        Location / Studio
                      </label>
                      <input
                        type="text"
                        placeholder="Kerala, India"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="w-full bg-[#221c18] border border-[#44362a] rounded-lg px-3 py-2 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmittingContent}
                    className="w-full py-3 bg-[#c98d48] hover:bg-[#dba15a] disabled:opacity-50 text-[#120f0d] font-semibold text-sm rounded-xl transition-all shadow-lg"
                  >
                    {isSubmittingContent ? 'Cataloging Media...' : 'Publish to Culture Archive'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="p-6 rounded-2xl bg-[#171310] border border-[#3e3126] space-y-4">
              <div className="flex items-center justify-between border-b border-[#31251c] pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#c98d48]" />
                  <h3 className="font-serif text-2xl text-[#f6ebd9]">
                    Consultations & Appointments ({myAppointments.length})
                  </h3>
                </div>
              </div>

              {myAppointments.length === 0 ? (
                <div className="py-12 text-center text-[#8e7e6f]">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-base text-[#bbb]">
                    You don't have any appointments yet.
                  </p>
                  <p className="text-xs text-[#777] mt-1">
                    When Explorers discover your profile and book consultations, they
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-4 rounded-xl bg-[#201915] border border-[#3d3126] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#f5ebd7]">
                            {appt.explorerName}
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
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-[#c98d48] font-medium mt-0.5">
                          {appt.purpose}
                        </p>
                        <div className="text-[#8e7e6e] mt-1">
                          Date: <strong>{appt.date}</strong> at <strong>{appt.time}</strong> • Email: {appt.explorerEmail}
                        </div>
                        {appt.notes && (
                          <p className="text-[#baa894] italic mt-1 font-body">
                            "{appt.notes}"
                          </p>
                        )}
                      </div>

                      {appt.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateAppointment(appt.id, 'Confirmed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 font-medium transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateAppointment(appt.id, 'Declined')}
                            className="px-3 py-1.5 bg-[#2d221a] hover:bg-[#3d2f25] text-rose-300 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY VIDEOS */}
          {activeTab === 'videos' && (
            <div className="p-6 rounded-2xl bg-[#171310] border border-[#3e3126] space-y-4">
              <div className="flex items-center justify-between border-b border-[#31251c] pb-3">
                <h3 className="font-serif text-2xl text-[#f6ebd9]">
                  Published Performance Videos ({myVideos.length})
                </h3>
                <button
                  onClick={() => {
                    setUploadType('video');
                    setActiveTab('upload');
                  }}
                  className="px-3 py-1 bg-[#c98d48] text-[#120f0d] text-xs font-semibold rounded-lg"
                >
                  + Add Video
                </button>
              </div>

              {myVideos.length === 0 ? (
                <div className="py-12 text-center text-[#888]">
                  <VideoIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-base text-[#ccc]">No videos published yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="p-3.5 rounded-xl bg-[#201915] border border-[#3e3126] flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-serif text-base text-[#f5ebd7] truncate">
                          {vid.title}
                        </h4>
                        <p className="text-xs text-[#c98d48]">{vid.cultureName}</p>
                      </div>

                      <div className="pt-3 flex items-center justify-between border-t border-[#31251c] mt-3">
                        <span className="text-[10px] text-[#8e7e6e] font-mono">
                          {vid.duration}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm('Delete this video from the archive?')) {
                              db.videos.delete(vid.id);
                              reloadData();
                            }
                          }}
                          className="text-[#999] hover:text-rose-400 p-1 text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MY ARTS */}
          {activeTab === 'arts' && (
            <div className="p-6 rounded-2xl bg-[#171310] border border-[#3e3126] space-y-4">
              <div className="flex items-center justify-between border-b border-[#31251c] pb-3">
                <h3 className="font-serif text-2xl text-[#f6ebd9]">
                  Published Artworks & Artifacts ({myArtworks.length})
                </h3>
                <button
                  onClick={() => {
                    setUploadType('artwork');
                    setActiveTab('upload');
                  }}
                  className="px-3 py-1 bg-[#c98d48] text-[#120f0d] text-xs font-semibold rounded-lg"
                >
                  + Add Artwork
                </button>
              </div>

              {myArtworks.length === 0 ? (
                <div className="py-12 text-center text-[#888]">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-base text-[#ccc]">No artworks cataloged yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myArtworks.map((art) => (
                    <div
                      key={art.id}
                      className="p-3.5 rounded-xl bg-[#201915] border border-[#3e3126] flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-square rounded-lg overflow-hidden bg-black mb-2">
                          <img
                            src={art.mediaUrl}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-serif text-base text-[#f5ebd7] truncate">
                          {art.title}
                        </h4>
                        <p className="text-xs text-[#c98d48]">{art.cultureName}</p>
                      </div>

                      <div className="pt-3 flex items-center justify-between border-t border-[#31251c] mt-3">
                        <span className="text-[10px] text-[#8e7e6e]">{art.location}</span>
                        <button
                          onClick={() => {
                            if (confirm('Delete this artwork?')) {
                              db.artworks.delete(art.id);
                              reloadData();
                            }
                          }}
                          className="text-[#999] hover:text-rose-400 p-1 text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: VERIFICATION ASSISTANCE */}
          {activeTab === 'verification' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#171310] border-2 border-[#43362a] shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#261f18] border border-[#c98d48]/40 text-[#c98d48]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-[#f6ebd9]">
                    Cultural Verification Status & Gemini Assistant
                  </h3>
                  <p className="text-xs text-[#baa894]">
                    GanaKala Loka uses Gemini-assisted evaluation of academy certificates and guru lineage proofs.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#201915] border border-[#3e3126] space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[#a69683]">Current Status:</span>
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded ${
                      artist.verificationStatus === 'Verified'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                    }`}
                  >
                    {artist.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a69683]">Registered Art Form:</span>
                  <span className="text-[#f5ebd7] font-medium">{artist.artForm}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a69683]">Years of Rigorous Practice:</span>
                  <span className="text-[#f5ebd7] font-medium">{artist.yearsExperience} Years</span>
                </div>
                {artist.verificationNotes && (
                  <div className="mt-3 pt-3 border-t border-[#31251c] text-[#ded3c3] italic">
                    "{artist.verificationNotes}"
                  </div>
                )}
              </div>

              {/* Resubmit / Supplementary Proof Form */}
              <div className="space-y-3 pt-2">
                <h4 className="font-serif text-lg text-[#f5ebd7]">
                  Submit Supplementary Lineage or Academy Proof
                </h4>
                <p className="text-xs text-[#8e7e6e]">
                  Describe or paste citations for your degree, guru endorsement, Sangeet Natak Akademi / state parishad recognition, or public concert history:
                </p>
                <textarea
                  rows={3}
                  value={reverifyDocDesc}
                  onChange={(e) => setReverifyDocDesc(e.target.value)}
                  placeholder="e.g., Kalakshetra Foundation Diploma in Bharatanatyam, 2018; CCRT National Scholarship Holder under Guru..."
                  className="w-full bg-[#201915] border border-[#44362a] rounded-lg p-3 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
                <button
                  type="button"
                  onClick={handleTriggerReverification}
                  disabled={isReverifying || !reverifyDocDesc.trim()}
                  className="px-5 py-2.5 bg-[#c98d48] hover:bg-[#d89b56] disabled:opacity-50 text-[#120f0d] font-semibold text-xs rounded-lg flex items-center gap-2 transition-all"
                >
                  {isReverifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Run Gemini Verification Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
