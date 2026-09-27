import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  X,
  Palette,
  Sparkles,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { CulturePlate } from '../../types';

export const AdminSketchbook: React.FC = () => {
  const [plates, setPlates] = useState<CulturePlate[]>([]);
  const [editingPlate, setEditingPlate] = useState<CulturePlate | null>(null);

  // Edit fields
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [region, setRegion] = useState('');
  const [era, setEra] = useState('');
  const [mudraOrElement, setMudraOrElement] = useState('');
  const [journalNote, setJournalNote] = useState('');
  const [image, setImage] = useState('');
  const [accentHex, setAccentHex] = useState('#c98d48');

  const loadPlates = () => {
    setPlates(db.culturePlates.getAll().sort((a, b) => a.order - b.order));
  };

  useEffect(() => {
    loadPlates();
    window.addEventListener('ganakala_data_changed', loadPlates);
    return () => window.removeEventListener('ganakala_data_changed', loadPlates);
  }, []);

  const handleOpenEdit = (plate: CulturePlate) => {
    setEditingPlate(plate);
    setTitle(plate.title);
    setSubTitle(plate.subTitle);
    setScriptText(plate.scriptText);
    setRegion(plate.region);
    setEra(plate.era);
    setMudraOrElement(plate.mudraOrElement);
    setJournalNote(plate.journalNote);
    setImage(plate.image);
    setAccentHex(plate.accentHex);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlate) return;

    db.culturePlates.update(editingPlate.id, {
      title,
      subTitle,
      scriptText,
      region,
      era,
      mudraOrElement,
      journalNote,
      image,
      accentHex,
    });

    setEditingPlate(null);
  };

  const movePlate = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= plates.length) return;

    const list = [...plates];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    const orderedIds = list.map((p) => p.id);
    db.culturePlates.reorder('kathakali', orderedIds);
    loadPlates();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            Sketchbook Codex & Botanical Plates
          </h2>
          <p className="text-xs text-[#a99784]">
            Curate the illustrated folio plates, Sanskrit script titles, mudra tags, and archival journal notes
          </p>
        </div>

        <div className="text-xs font-mono text-[#c98d48] bg-[#221b16] px-3 py-1.5 rounded-xl border border-[#443528]">
          {plates.length} Curated Folio Plates
        </div>
      </div>

      {/* Plates List */}
      <div className="space-y-3">
        {plates.map((plate, index) => (
          <div
            key={plate.id}
            className="bg-[#181310] border border-[#372b22] hover:border-[#c98d48]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              {/* Order Buttons */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => movePlate(index, 'up')}
                  className="p-1 rounded bg-[#251d17] hover:bg-[#342921] disabled:opacity-30 text-[#baa794]"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === plates.length - 1}
                  onClick={() => movePlate(index, 'down')}
                  className="p-1 rounded bg-[#251d17] hover:bg-[#342921] disabled:opacity-30 text-[#baa794]"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-[#3e3025] shrink-0">
                <img
                  src={plate.image}
                  alt={plate.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#c98d48] font-semibold">
                    {plate.plateNumber}
                  </span>
                  <span className="text-[11px] font-mono text-[#8a7a6b]">
                    {plate.era}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                    style={{ backgroundColor: plate.accentHex }}
                  />
                </div>
                <h4 className="font-serif text-base font-bold text-[#f5ebd7] truncate">
                  {plate.title}
                </h4>
                <p className="text-xs text-[#a99786] truncate">
                  {plate.subTitle} · <span className="font-mono text-[#caa578]">{plate.scriptText}</span>
                </p>
                <p className="text-[11px] text-[#78695c] truncate">
                  Mudra / Key: {plate.mudraOrElement} · {plate.region}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => handleOpenEdit(plate)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#251d17] hover:bg-[#342921] border border-[#443528] rounded-xl text-xs text-[#f2cb97] transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Plate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plate Modal */}
      {editingPlate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181310] border border-[#3f3126] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs text-[#ede5d8]">
            <div className="flex items-center justify-between border-b border-[#30251c] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c98d48]">
                  Editing {editingPlate.plateNumber}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#f7ede0] mt-0.5">
                  {editingPlate.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingPlate(null)}
                className="p-1 rounded-lg text-[#948373] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Plate Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Sub Title
                  </label>
                  <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Sanskrit / Malayalam Script Text
                  </label>
                  <input
                    type="text"
                    value={scriptText}
                    onChange={(e) => setScriptText(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Mudra / Key Element
                  </label>
                  <input
                    type="text"
                    value={mudraOrElement}
                    onChange={(e) => setMudraOrElement(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Era / Period
                  </label>
                  <input
                    type="text"
                    value={era}
                    onChange={(e) => setEra(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="w-full h-8 bg-[#201814] border border-[#34271e] rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#baa794] font-medium mb-1">
                  Plate Artwork Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#baa794] font-medium mb-1">
                  Archival Journal Note
                </label>
                <textarea
                  rows={3}
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#30251c]">
                <button
                  type="button"
                  onClick={() => setEditingPlate(null)}
                  className="px-4 py-2 rounded-xl bg-[#261d17] hover:bg-[#342921] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c98d48] hover:bg-[#d89b56] text-[#14110e] text-xs font-semibold shadow-md"
                >
                  Save Plate Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
