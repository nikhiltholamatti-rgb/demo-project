import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Palette,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { Culture } from '../../types';
import { AdminView } from './AdminLayout';

interface AdminCultureFormProps {
  cultureId?: string;
  onNavigate: (view: AdminView, param?: string) => void;
  onSaved: (savedCulture: Culture) => void;
}

export const AdminCultureForm: React.FC<AdminCultureFormProps> = ({
  cultureId,
  onNavigate,
  onSaved,
}) => {
  const isEditing = !!cultureId;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [canonicalName, setCanonicalName] = useState('');
  const [category, setCategory] = useState<Culture['category']>('Classical Dance');
  const [region, setRegion] = useState('');
  const [overview, setOverview] = useState('');
  const [history, setHistory] = useState('');
  const [significance, setSignificance] = useState('');
  const [performanceStyle, setPerformanceStyle] = useState('');
  const [costumes, setCostumes] = useState('');
  const [instruments, setInstruments] = useState('');
  const [traditions, setTraditions] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [imagePlate, setImagePlate] = useState('');
  const [accentColor, setAccentColor] = useState('#c98d48');

  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cultureId) {
      const c = db.cultures.getById(cultureId) || db.cultures.getBySlug(cultureId);
      if (c) {
        setName(c.name);
        setSlug(c.slug);
        setCanonicalName(c.canonicalName || '');
        setCategory(c.category);
        setRegion(c.region);
        setOverview(c.overview);
        setHistory(c.history);
        setSignificance(c.significance || '');
        setPerformanceStyle(c.performanceStyle || '');
        setCostumes(c.costumes || '');
        setInstruments(c.instruments || '');
        setTraditions(c.traditions || '');
        setBannerUrl(c.bannerUrl || '');
        setImagePlate(c.imagePlate || '');
        setAccentColor(c.accentColor || '#c98d48');
      }
    }
  }, [cultureId]);

  // Auto-generate slug from name if not manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  // Image Upload Handlers
  const handleUploadImage = async (
    file: File,
    type: 'banner' | 'main'
  ) => {
    if (type === 'banner') setUploadingBanner(true);
    else setUploadingMain(true);

    try {
      const url = await db.media.uploadFile(file, 'culture-images');
      if (type === 'banner') {
        setBannerUrl(url);
      } else {
        setImagePlate(url);
      }
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || 'Error uploading image'}`);
    } finally {
      if (type === 'banner') setUploadingBanner(false);
      else setUploadingMain(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !slug || !region || !overview || !history) {
      setError('Please fill in all essential required fields: Name, Slug, Region, Overview, History.');
      return;
    }

    setSaving(true);
    try {
      const cultureData: Omit<Culture, 'id' | 'createdAt'> & { id?: string } = {
        id: cultureId || `culture-${slug}`,
        name,
        slug,
        canonicalName: canonicalName || name,
        category,
        region,
        overview,
        history,
        significance: significance || overview,
        performanceStyle: performanceStyle || 'Traditional heritage performance.',
        costumes: costumes || 'Traditional ceremonial costumes.',
        instruments: instruments || 'Traditional musical instruments.',
        traditions: traditions || 'Heritage sampradaya and seasonal rituals.',
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1600&q=80',
        imagePlate: imagePlate || bannerUrl || 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80',
        accentColor,
      };

      const saved = isEditing && cultureId
        ? db.cultures.update(cultureId, cultureData)
        : db.cultures.create(cultureData);

      onSaved(saved);
      onNavigate('cultures');
    } catch (err: any) {
      setError(err?.message || 'Failed to save culture.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('cultures')}
          className="flex items-center gap-2 text-xs text-[#a99786] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cultures List</span>
        </button>

        <span className="text-[10px] font-mono uppercase tracking-widest text-[#c98d48] bg-[#221b16] px-2.5 py-1 rounded-full border border-[#443528]">
          {isEditing ? 'Edit Culture' : 'New Culture Entry'}
        </span>
      </div>

      <div className="bg-[#181310] border border-[#3c2f24] rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            {isEditing ? `Edit: ${name || 'Culture'}` : 'Publish New Culture to Codex'}
          </h2>
          <p className="text-xs text-[#9d8c7b] mt-1">
            Fill in the details below. Once published, this culture will automatically sync to Supabase and become live on the public website.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
          {/* Section 1: Basic Identity */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#f0c88f] border-b border-[#30251c] pb-2">
              1. Basic Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Culture Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathakali, Bharatanatyam, Sitar"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl px-3.5 py-2.5 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  URL Slug <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kathakali"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl px-3.5 py-2.5 text-[#ede5d8] placeholder-[#7d6c5d] font-mono focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Canonical Script Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kathakali (കഥകളി) or Yakshagana (ಯಕ್ಷಗಾನ)"
                  value={canonicalName}
                  onChange={(e) => setCanonicalName(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl px-3.5 py-2.5 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Art Form Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl px-3.5 py-2.5 text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                >
                  <option value="Classical Dance">Classical Dance</option>
                  <option value="Classical Music">Classical Music</option>
                  <option value="Folk & Ritual Theatre">Folk & Ritual Theatre</option>
                  <option value="Traditional Art & Craft">Traditional Art & Craft</option>
                  <option value="Martial Art">Martial Art</option>
                  <option value="Folk Music">Folk Music</option>
                </select>
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Region / State of Origin <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerala, South India"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl px-3.5 py-2.5 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#c98d48]" />
                  <span>Accent Theme Color</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border border-[#3e3025] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-[#221b16] border border-[#3e3025] rounded-xl px-3 py-2 text-[#ede5d8] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Image Media & Uploads (Requirement 6) */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#f0c88f] border-b border-[#30251c] pb-2">
              2. Imagery (Banner & Main Display Plate)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Banner Image */}
              <div className="space-y-2">
                <label className="block text-[#bdaea0] font-medium">
                  Banner Hero Image
                </label>
                <div className="relative h-36 rounded-2xl overflow-hidden bg-[#241c17] border border-[#3f3126] flex items-center justify-center">
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-[#7e6d5d] space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-[11px]">No banner image set</p>
                    </div>
                  )}

                  {bannerUrl && (
                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-rose-400 hover:text-white"
                      title="Clear image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter image URL or upload..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="flex-1 bg-[#221b16] border border-[#3e3025] rounded-xl px-3 py-2 text-[11px] text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                  />
                  <label className="px-3 py-2 bg-[#2d221b] hover:bg-[#3d3025] border border-[#4d3c2e] text-[#f2cb97] rounded-xl cursor-pointer text-[11px] flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className={`w-3.5 h-3.5 ${uploadingBanner ? 'animate-bounce' : ''}`} />
                    <span>{uploadingBanner ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file, 'banner');
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Main Plate Image */}
              <div className="space-y-2">
                <label className="block text-[#bdaea0] font-medium">
                  Main Exhibition Image / Plate
                </label>
                <div className="relative h-36 rounded-2xl overflow-hidden bg-[#241c17] border border-[#3f3126] flex items-center justify-center">
                  {imagePlate ? (
                    <img
                      src={imagePlate}
                      alt="Plate Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-[#7e6d5d] space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-[11px]">No main plate image set</p>
                    </div>
                  )}

                  {imagePlate && (
                    <button
                      type="button"
                      onClick={() => setImagePlate('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-rose-400 hover:text-white"
                      title="Clear image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter image URL or upload..."
                    value={imagePlate}
                    onChange={(e) => setImagePlate(e.target.value)}
                    className="flex-1 bg-[#221b16] border border-[#3e3025] rounded-xl px-3 py-2 text-[11px] text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                  />
                  <label className="px-3 py-2 bg-[#2d221b] hover:bg-[#3d3025] border border-[#4d3c2e] text-[#f2cb97] rounded-xl cursor-pointer text-[11px] flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className={`w-3.5 h-3.5 ${uploadingMain ? 'animate-bounce' : ''}`} />
                    <span>{uploadingMain ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file, 'main');
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Codex Narratives */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#f0c88f] border-b border-[#30251c] pb-2">
              3. Cultural Dossier & Narratives
            </h3>

            <div>
              <label className="block text-[#bdaea0] font-medium mb-1">
                Overview / Synopsis <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Brief summary of the tradition, visual signature, and core philosophy..."
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl p-3 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
              />
            </div>

            <div>
              <label className="block text-[#bdaea0] font-medium mb-1">
                Historical Lineage & Evolution <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Origins, century, classical treatises (Natya Shastra, etc.), royal patrons..."
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl p-3 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Cultural Significance
                </label>
                <textarea
                  rows={2}
                  placeholder="Spiritual meaning, temple rituals, philosophical context..."
                  value={significance}
                  onChange={(e) => setSignificance(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl p-3 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Performance Style & Technique
                </label>
                <textarea
                  rows={2}
                  placeholder="Mudras, Navarasas, footwork, musical tala, dialogue..."
                  value={performanceStyle}
                  onChange={(e) => setPerformanceStyle(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl p-3 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Costumes & Aharya Abhinaya
                </label>
                <textarea
                  rows={2}
                  placeholder="Makeup types, gilded headpieces, silks, jewelry..."
                  value={costumes}
                  onChange={(e) => setCostumes(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl p-3 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#bdaea0] font-medium mb-1">
                  Instruments & Musical Accompaniment
                </label>
                <textarea
                  rows={2}
                  placeholder="Drums, string instruments, cymbals, vocal styles..."
                  value={instruments}
                  onChange={(e) => setInstruments(e.target.value)}
                  className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl p-3 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#bdaea0] font-medium mb-1">
                Seasonal Traditions & Festivals
              </label>
              <textarea
                rows={2}
                placeholder="Annual temple festivals, harvest melas, guru-shishya celebrations..."
                value={traditions}
                onChange={(e) => setTraditions(e.target.value)}
                className="w-full bg-[#221b16] border border-[#3e3025] rounded-xl p-3 text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
              />
            </div>
          </div>

          {/* Form Submit & Cancel Actions */}
          <div className="pt-4 border-t border-[#31251c] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('cultures')}
              className="px-5 py-2.5 bg-[#251e18] hover:bg-[#342921] text-xs text-[#cfc0ae] rounded-xl border border-[#44362b] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-[#c98d48] hover:bg-[#d89b56] disabled:opacity-50 text-[#120f0d] font-semibold text-xs rounded-xl shadow-lg transition-all active:scale-98 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Publishing to Database...' : isEditing ? 'Update Culture' : 'Publish Culture to Website'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
