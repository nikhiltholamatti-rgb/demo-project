import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { Culture } from '../../types';
import { AdminView } from './AdminLayout';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface AdminCulturesProps {
  onNavigate: (view: AdminView, param?: string) => void;
  onOpenPublicCulture: (slug: string) => void;
}

export const AdminCultures: React.FC<AdminCulturesProps> = ({
  onNavigate,
  onOpenPublicCulture,
}) => {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [deletingCulture, setDeletingCulture] = useState<Culture | null>(null);

  const loadCultures = () => {
    setCultures(db.cultures.getAll());
  };

  useEffect(() => {
    loadCultures();
    window.addEventListener('ganakala_data_changed', loadCultures);
    return () => window.removeEventListener('ganakala_data_changed', loadCultures);
  }, []);

  const handleDelete = () => {
    if (!deletingCulture) return;
    db.cultures.delete(deletingCulture.id);
    setDeletingCulture(null);
  };

  const categories = [
    'All',
    'Classical Dance',
    'Classical Music',
    'Folk & Ritual Theatre',
    'Traditional Art & Craft',
    'Martial Art',
    'Folk Music',
  ];

  const regions = [
    'All',
    ...Array.from(new Set(cultures.map((c) => c.region).filter(Boolean))),
  ];

  const filteredCultures = cultures.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.canonicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || c.category === categoryFilter;

    const matchesRegion =
      regionFilter === 'All' || c.region === regionFilter;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            Culture Codex Management
          </h2>
          <p className="text-xs text-[#a99784]">
            Create, edit, curate and publish Indian classical and folk heritage traditions
          </p>
        </div>

        <button
          onClick={() => onNavigate('culture-new')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#c98d48] hover:bg-[#d89b56] text-xs text-[#14110e] font-semibold rounded-xl shadow-md transition-all active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Culture</span>
        </button>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-[#181310] border border-[#3c2f24] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7a69]" />
          <input
            type="text"
            placeholder="Search by culture name, canonical name, region, history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#221b16] border border-[#3e3025] rounded-xl text-xs text-[#f5ebd7] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#c98d48] shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#221b16] border border-[#3e3025] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48] w-full md:w-auto"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-[#221b16] border border-[#3e3025] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48] w-full md:w-auto"
          >
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg === 'All' ? 'All Regions' : reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cultures Grid */}
      {filteredCultures.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#181310] border border-[#3c2f24] text-[#867566] text-xs space-y-3">
          <Landmark className="w-10 h-10 mx-auto text-[#4d3a2b]" />
          <p className="font-serif text-lg text-[#ccc]">No records available.</p>
          <p className="text-[11px] text-[#777]">
            Click "Add New Culture" to publish your first tradition to the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCultures.map((c) => {
            const platesCount = db.culturePlates.getByCulture(c.slug).length;

            return (
              <div
                key={c.id}
                className="bg-[#181310] border border-[#3c2f24] hover:border-[#c98d48]/70 rounded-3xl overflow-hidden shadow-xl flex flex-col transition-all group"
              >
                {/* Image Banner */}
                <div className="relative h-44 overflow-hidden bg-[#241c17]">
                  <img
                    src={c.bannerUrl || c.imagePlate}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181310] via-black/30 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#554333] text-[10px] font-mono text-[#f0c88f]">
                      {c.category}
                    </span>
                  </div>

                  {/* Accent Color Dot */}
                  <div
                    className="absolute top-3 right-3 w-4 h-4 rounded-full border border-white/40 shadow"
                    style={{ backgroundColor: c.accentColor || '#c98d48' }}
                    title={`Accent: ${c.accentColor}`}
                  />

                  {/* Title on Banner */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-serif text-xl font-bold text-white drop-shadow">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-[#dac8b5] font-mono truncate">
                      {c.canonicalName || c.region}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-[#a99786] line-clamp-2 leading-relaxed">
                    {c.overview}
                  </p>

                  <div className="pt-2 border-t border-[#292019] flex items-center justify-between text-[11px] font-mono text-[#8b7968]">
                    <span>Region: <strong className="text-[#d8c8b6] font-sans">{c.region}</strong></span>
                    <span className="flex items-center gap-1 text-[#caa578]">
                      <Layers className="w-3 h-3" />
                      <span>{platesCount} plates</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#292019] grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => onOpenPublicCulture(c.slug)}
                      className="p-2 rounded-xl bg-[#221b16] hover:bg-[#312720] text-[#cfc0ae] hover:text-white border border-[#3e3025] transition-colors flex items-center justify-center gap-1 text-[11px]"
                      title="View in Public Website"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#c98d48]" />
                    </button>

                    <button
                      onClick={() => onNavigate('sketchbook', c.slug)}
                      className="p-2 rounded-xl bg-[#221b16] hover:bg-[#312720] text-[#cfc0ae] hover:text-[#f0c88f] border border-[#3e3025] transition-colors flex items-center justify-center gap-1 text-[11px]"
                      title="Manage Sketchbook Plates"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#c98d48]" />
                    </button>

                    <button
                      onClick={() => onNavigate('culture-edit', c.id)}
                      className="p-2 rounded-xl bg-[#221b16] hover:bg-[#312720] text-[#cfc0ae] hover:text-white border border-[#3e3025] transition-colors flex items-center justify-center gap-1 text-[11px]"
                      title="Edit Culture Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingCulture(c)}
                      className="p-2 rounded-xl bg-[#271c19] hover:bg-rose-950/70 text-[#a98f82] hover:text-rose-300 border border-[#442c26] transition-colors flex items-center justify-center gap-1 text-[11px]"
                      title="Delete Culture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCulture && (
        <DeleteConfirmModal
          isOpen={!!deletingCulture}
          itemType="Culture"
          itemName={deletingCulture.name}
          warningNote="Deleting this culture will also remove its associated Sketchbook plates and un-link related artworks from the public website."
          onConfirm={handleDelete}
          onCancel={() => setDeletingCulture(null)}
        />
      )}
    </div>
  );
};
