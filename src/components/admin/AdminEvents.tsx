import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { CulturalEvent } from '../../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CulturalEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CulturalEvent | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [cultureName, setCultureName] = useState('Kathakali');
  const [artistName, setArtistName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Classical Dance');

  const loadEvents = () => {
    setEvents(db.events.getAll());
  };

  useEffect(() => {
    loadEvents();
    window.addEventListener('ganakala_data_changed', loadEvents);
    return () => window.removeEventListener('ganakala_data_changed', loadEvents);
  }, []);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setTitle('');
    setCultureName('Kathakali');
    setArtistName('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('18:30');
    setLocation('Koothambalam, Kalamandalam, Kerala');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80');
    setCategory('Classical Dance');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: CulturalEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setCultureName(ev.cultureName || 'Kathakali');
    setArtistName(ev.artistName || '');
    setDate(ev.date);
    setTime(ev.time);
    setLocation(ev.location);
    setDescription(ev.description);
    setImageUrl(ev.imageUrl);
    setCategory(ev.category || 'Classical Dance');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location) return;

    if (editingEvent) {
      db.events.update(editingEvent.id, {
        title,
        cultureName,
        artistName,
        date,
        time,
        location,
        description,
        imageUrl,
        category,
      });
    } else {
      db.events.create({
        title,
        cultureName,
        artistName,
        date,
        time,
        location,
        description,
        imageUrl,
        category,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingEvent) return;
    db.events.delete(deletingEvent.id);
    setDeletingEvent(null);
  };

  const filteredEvents = events.filter((e) => {
    return (
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.artistName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.cultureName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f7ede0]">
            Cultural Events & Festivals
          </h2>
          <p className="text-xs text-[#a99784]">
            Schedule and publish sacred performances, temple festivals, and masterclasses
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#c98d48] hover:bg-[#d89b56] text-xs text-[#14110e] font-semibold rounded-xl shadow-md transition-all active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d6c5d]" />
        <input
          type="text"
          placeholder="Search events by title, culture, artist, venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1b1512] border border-[#3b2e24] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#ede5d8] placeholder-[#7d6c5d] focus:outline-none focus:border-[#c98d48]"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#7d6c5d] bg-[#181310] border border-[#372b22] rounded-2xl">
            No events found. Click "Schedule New Event" to add one.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-[#181310] border border-[#372b22] hover:border-[#c98d48]/50 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-black/40">
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-[#f0c88f] border border-[#523e2d]">
                    {ev.category || 'Cultural Event'}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-mono text-[#c98d48] uppercase tracking-wider block">
                    {ev.cultureName}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#f5ebd7] leading-snug">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-[#baa794] line-clamp-2">
                    {ev.description}
                  </p>

                  <div className="pt-2 space-y-1 text-[11px] text-[#9a8877]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#c98d48]" />
                      <span>{ev.date} {ev.time && `at ${ev.time}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#c98d48]" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-[#292019] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#6c5b4d]">
                  {ev.artistName ? `Artist: ${ev.artistName}` : 'All Master Artists'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 rounded-lg bg-[#271e19] hover:bg-[#382b22] text-[#e0cfbb] transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingEvent(ev)}
                    className="p-1.5 rounded-lg bg-[#2b1816] hover:bg-[#3d1f1c] text-rose-300 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181310] border border-[#3f3126] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs text-[#ede5d8]">
            <div className="flex items-center justify-between border-b border-[#30251c] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#f7ede0]">
                {editingEvent ? 'Edit Cultural Event' : 'Schedule Cultural Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#948373] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[#baa794] font-medium mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cheruthuruthy Kalivilakku All-Night Kathakali"
                  className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Culture Form
                  </label>
                  <input
                    type="text"
                    value={cultureName}
                    onChange={(e) => setCultureName(e.target.value)}
                    placeholder="e.g. Kathakali"
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Lead Artist (Optional)
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g. Rama Narayanan"
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
                <div>
                  <label className="block text-[#baa794] font-medium mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#baa794] font-medium mb-1">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Koothambalam, Kalamandalam, Kerala"
                  className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#baa794] font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding the event, performers, and sacred significance..."
                  className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div>
                <label className="block text-[#baa794] font-medium mb-1">
                  Banner / Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#201814] border border-[#34271e] rounded-xl px-3.5 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-[#c98d48]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#30251c]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#261d17] hover:bg-[#342921] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c98d48] hover:bg-[#d89b56] text-[#14110e] text-xs font-semibold shadow-md"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingEvent}
        title="Delete Event"
        itemName={deletingEvent?.title || 'this event'}
        warningMessage="This will permanently delete this cultural event from GanaKala Loka and Supabase."
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
