import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  Compass,
  Palette,
  Eye,
  Info,
  Layers,
} from 'lucide-react';
import { INITIAL_CULTURES } from '../../lib/initialData';
import { db } from '../../lib/supabase';

export interface MengToSketchbookLandingPageProps {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
  onEnterArtist?: () => void;
  onEnterExplorer?: () => void;
  onSelectCulture?: (slug: string) => void;
}

interface SketchbookPlate {
  id: string;
  plateNumber: string;
  title: string;
  subTitle: string;
  scriptText: string;
  region: string;
  era: string;
  image: string;
  cultureSlug: string;
  journalNote: string;
  mudraOrElement: string;
  accentHex: string;
}

const PLATES: SketchbookPlate[] = [
  {
    id: 'plate-1',
    plateNumber: 'PLATE I',
    title: 'Kathakali — Paccha & Kalivilakku',
    subTitle: 'The Celestial Hero & Temple Oil Flame',
    scriptText: 'കഥകളി • പച്ച വേഷം',
    region: 'Kerala, Malabar Coast',
    era: '17th Century CE',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'kathakali',
    journalNote:
      'Sketched before the sacred brass Kalivilakku lamp at Cheruthuruthy. The Paccha actor undergoes 4 hours of Chutti paste layering. The eyes, reddened with chundappoovu seeds, command the entire courtyard without uttering a single spoken word.',
    mudraOrElement: 'Pataka & Mudrakhya Mudras • Navarasa',
    accentHex: '#388e3c',
  },
  {
    id: 'plate-2',
    plateNumber: 'PLATE II',
    title: 'Yakshagana — Gilded Mundale',
    subTitle: 'All-Night Bayalata of the Sacred Epics',
    scriptText: 'ಯಕ್ಷಗಾನ • ಬಡಗು ತಿಟ್ಟು',
    region: 'Coastal Karnataka',
    era: '11th–16th Century CE',
    image: 'https://images.unsplash.com/photo-1609137144820-2b7e5e3477d9?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'yakshagana',
    journalNote:
      'Under the winter harvest stars of Kundapura, the Chande drum awakens the village. The Bhagavata strikes the bronze tala while actors adorned in monumental winged headdresses enter through the fiery curtain.',
    mudraOrElement: 'Mundale Turban • Chande & Maddale Polyrhythms',
    accentHex: '#d97736',
  },
  {
    id: 'plate-3',
    plateNumber: 'PLATE III',
    title: 'Bharatanatyam — Sculptural Aramandi',
    subTitle: 'Sacred Temple Geometry & Visual Yoga',
    scriptText: 'பரதநாட்டியம் • நடன யோகம்',
    region: 'Thanjavur, Tamil Nadu',
    era: '2nd Century BCE / Natya Shastra',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'bharatanatyam',
    journalNote:
      'Echoes of the Brihadisvara granite friezes. The Aramandi half-squat creates a balanced triangle through which energy circulates. Pleated silks fan outwards with mathematical grace as the bells (Salangai) chime in Teental.',
    mudraOrElement: 'Alarippu & Varnam • Kanchipuram Pleats',
    accentHex: '#b83280',
  },
  {
    id: 'plate-4',
    plateNumber: 'PLATE IV',
    title: 'Carnatic Saraswati Veena',
    subTitle: 'The 24 Brass Frets of Nada Brahma',
    scriptText: 'ಕರ್ನಾಟಕ ಸಂಗೀತ • ಸರಸ್ವತೀ ವೀಣಾ',
    region: 'Mysore & Thanjavur Lineages',
    era: 'Purandara Dasa Tradition',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'carnatic-music',
    journalNote:
      'Crafted from seasoned jackfruit wood (Palmaram), the yali head gazes upward. Twenty-four brass frets fixed with bee wax yield the oscillating microtonal gamakas of Kalyani and Todi ragas.',
    mudraOrElement: 'Kalyani Gamaka • Jackfruit Kudam',
    accentHex: '#c98d48',
  },
  {
    id: 'plate-5',
    plateNumber: 'PLATE V',
    title: 'Kuchipudi — Tarangam Balance',
    subTitle: 'Dance of the Brass Rim & Water Vessel',
    scriptText: 'కూచిపూడి • తరంగం',
    region: 'Kuchelapuram, Andhra Pradesh',
    era: '17th Century CE / Siddhendra Yogi',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'kuchipudi',
    journalNote:
      'A thrilling synthesis of divine theater and supreme balance. The dancer balances a brass vessel of water upon her brow while stamping intricate rhythms along the edge of a polished brass plate.',
    mudraOrElement: 'Bhamakalapam • Brass Plate Tarangam',
    accentHex: '#e11d48',
  },
  {
    id: 'plate-6',
    plateNumber: 'PLATE VI',
    title: 'Hindustani Classical Sitar',
    subTitle: 'The Resonant Gourd & Sympathetic Tarab',
    scriptText: 'हिंदुस्तानी संगीत • सितार',
    region: 'Maihar & Senia Gharanas',
    era: 'Amir Khusrau & Mughal Court Lineage',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'hindustani-classical',
    journalNote:
      'The seasoned pumpkin resonator (tumba) vibrates with 13 sympathetic tarab strings beneath curved steel frets. The meend glide bends four microtones across a single fret, tracing the twilight depths of Raga Yaman.',
    mudraOrElement: 'Vilambit to Drut • Bone Jawari Bridge',
    accentHex: '#4f46e5',
  },
  {
    id: 'plate-7',
    plateNumber: 'PLATE VII',
    title: 'Odissi — Konark Tribhanga',
    subTitle: 'Living Stone Carvings of Lord Jagannath',
    scriptText: 'ଓଡ଼ିଶୀ • ତ୍ରିଭଙ୍ଗ ମୁଦ୍ରା',
    region: 'Bhubaneswar & Konark, Odisha',
    era: '2nd Century BCE Udayagiri',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'odissi',
    journalNote:
      'The soft lyrical curves of Tribhanga (three deflections of head, torso, and hips) evoke the stone dancers on the Konark wheel. Crowned with the tall white sola-pith Tahia, the dancer offers lyrical Gita Govinda verses.',
    mudraOrElement: 'Chauka & Tribhanga • Cuttack Silver Filigree',
    accentHex: '#059669',
  },
  {
    id: 'plate-8',
    plateNumber: 'PLATE VIII',
    title: 'Kalaripayattu — Sacred Kalari Pit',
    subTitle: 'The Mother of Martial Arts & Marma Vaythari',
    scriptText: 'കളരിപ്പയറ്റ് • പൂത്തറ',
    region: 'Northern & Southern Kerala',
    era: 'Sangam Era / Sage Parasurama',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'kalaripayattu',
    journalNote:
      'Dug four feet into the cool red earth, the Kalari pit reverberates with the master\'s Vaythari verbal cadences. The practitioners move with animal postures (Gajavadivu, Simhavadivu) before the sacred seven-tiered Poothara shrine.',
    mudraOrElement: 'Poothara Shrine • Flexible Urumi Sword',
    accentHex: '#b45309',
  },
  {
    id: 'plate-9',
    plateNumber: 'PLATE IX',
    title: 'Mithila & Madhubani Art',
    subTitle: 'Natural Mineral Dyes & Wedding Kohbar Murals',
    scriptText: 'मिथिला चित्रकला • कोहबर',
    region: 'Mithila, Bihar',
    era: 'Vedic Antiquity to Modern GI Guilds',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85',
    cultureSlug: 'madhubani-art',
    journalNote:
      'Drawn with bamboo twigs and cotton swabs dipped in lampblack soot, crushed marigold petals, and indigo. The intricate double lines are filled with cross-hatching (Katchni) portraying the lotus, fish, and sun of fertility.',
    mudraOrElement: 'Double Line Katchni • Indigo & Turmeric Dyes',
    accentHex: '#9333ea',
  },
];

export const MengToSketchbookLandingPage: React.FC<MengToSketchbookLandingPageProps> = ({
  headingFont = 'Instrument Serif, Georgia, serif',
  bodyFont = 'Newsreader, Georgia, serif',
  primaryColor = '#2b2721',
  onEnterArtist,
  onEnterExplorer,
  onSelectCulture,
}) => {
  const [activePlateIndex, setActivePlateIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isMagnifierActive, setIsMagnifierActive] = useState<boolean>(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 50, y: 50 });
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const plateContainerRef = useRef<HTMLDivElement>(null);

  const [plates, setPlates] = useState<SketchbookPlate[]>(() => {
    const stored = db.culturePlates.getAll();
    return stored.length > 0 ? (stored as any) : PLATES;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const stored = db.culturePlates.getAll();
      if (stored.length > 0) {
        setPlates(stored as any);
      }
    };
    window.addEventListener('ganakala_data_changed', handleUpdate);
    return () => window.removeEventListener('ganakala_data_changed', handleUpdate);
  }, []);

  const activePlate = plates[activePlateIndex] || plates[0] || PLATES[0];

  const handleNextPlate = () => {
    if (isFlipping || plates.length === 0) return;
    setFlipDirection('next');
    setIsFlipping(true);
    setTimeout(() => {
      setActivePlateIndex((prev) => (prev + 1) % plates.length);
      setIsFlipping(false);
    }, 280);
  };

  const handlePrevPlate = () => {
    if (isFlipping || plates.length === 0) return;
    setFlipDirection('prev');
    setIsFlipping(true);
    setTimeout(() => {
      setActivePlateIndex((prev) => (prev - 1 + plates.length) % plates.length);
      setIsFlipping(false);
    }, 280);
  };

  // Magnifier mouse move handler
  const handlePlateMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!plateContainerRef.current) return;
    const rect = plateContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMagnifierPos({ x, y });
  };

  return (
    <div
      className="relative w-full min-h-screen bg-[#110f0e] text-[#f4eee4] overflow-hidden select-none"
      style={{
        fontFamily: bodyFont,
        color: '#ede6d8',
      }}
    >
      {/* Background ambient lighting and parchment wash */}
      <div className="absolute inset-0 bg-parchment opacity-95 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-700/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-700/10 blur-3xl pointer-events-none" />

      {/* Top Sketchbook Status & Brand Banner */}
      <header className="relative z-20 border-b border-[#3a3127]/60 bg-[#161311]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c98d48] to-[#7f4f1d] flex items-center justify-center shadow-lg border border-[#f0c587]/30">
            <span className="font-serif text-lg font-bold text-[#14110e]">ॐ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl sm:text-2xl font-serif tracking-wide text-[#f5ebd7]"
                style={{ fontFamily: headingFont }}
              >
                GanaKala Loka
              </h1>
              <span className="text-[10px] tracking-widest uppercase bg-[#2e261f] text-[#d6a56b] border border-[#d6a56b]/30 px-2 py-0.5 rounded">
                Cultural Sketchbook Edition
              </span>
            </div>
            <p className="text-xs text-[#a69683]">
              Living Codex of Indian Classical Arts, Drama & Heritage
            </p>
          </div>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsIndexOpen(!isIndexOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-md bg-[#241e19] border border-[#44382c] hover:border-[#c98d48] text-[#e0d3c1] transition-all hover:bg-[#2e2620]"
          >
            <Layers className="w-3.5 h-3.5 text-[#c98d48]" />
            <span className="hidden sm:inline">Index of Plates</span> ({activePlateIndex + 1}/9)
          </button>

          {/* Dual Enter CTAs */}
          <button
            onClick={onEnterArtist}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans font-medium rounded-md bg-gradient-to-r from-[#8b5a2b] to-[#b3773b] hover:from-[#9c6531] hover:to-[#c48443] text-white shadow-md border border-[#f0c388]/40 transition-all hover:scale-105 active:scale-95"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Artist Studio</span>
          </button>

          <button
            onClick={onEnterExplorer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans font-medium rounded-md bg-[#c98d48] hover:bg-[#d89b56] text-[#120f0d] font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span>Enter Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Sketchbook Canvas Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col items-center">
        {/* Curled Botanical Sketchbook Folio */}
        <div
          className={`relative w-full max-w-5xl rounded-2xl bg-[#1d1815] border-2 border-[#43372c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-4 sm:p-8 transition-transform duration-300 ${
            isFlipping
              ? flipDirection === 'next'
                ? 'rotate-1 scale-[0.98] opacity-75'
                : '-rotate-1 scale-[0.98] opacity-75'
              : ''
          }`}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center top',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 100px rgba(0,0,0,0.3)',
          }}
        >
          {/* Deckled paper edge styling & binding stitching */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#120e0b] to-transparent pointer-events-none opacity-80" />
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[#120e0b] to-transparent pointer-events-none opacity-80" />

          {/* Tactile Curled Page Corner indicator */}
          <div
            onClick={handleNextPlate}
            title="Click to turn to next plate"
            className="absolute top-0 right-0 w-12 h-12 overflow-hidden cursor-pointer z-20 group"
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#c98d48] to-[#261f18] rounded-bl-xl shadow-lg border-b border-l border-[#f5d098]/40 group-hover:w-10 group-hover:h-10 transition-all" />
            <div className="absolute top-1 right-1 text-[9px] font-sans font-bold text-[#14110e]">↷</div>
          </div>

          {/* Plate Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#3b3026] pb-4 mb-6 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tracking-widest text-[#c98d48]">
                  {activePlate.plateNumber}
                </span>
                <span className="text-[#655546]">•</span>
                <span className="text-xs text-[#a99884] uppercase tracking-wider font-sans">
                  {activePlate.region}
                </span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-serif text-[#f4ecdf] tracking-tight mt-0.5"
                style={{ fontFamily: headingFont }}
              >
                {activePlate.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#caa270] italic">
                {activePlate.scriptText} — {activePlate.subTitle}
              </p>
            </div>

            {/* Interactive Tool Ribbon: Magnifier + Zoom Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#14110e] border border-[#3f3429] p-1.5 rounded-lg shadow-inner">
              <button
                onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                  isMagnifierActive
                    ? 'bg-[#c98d48] text-[#120f0d] font-bold shadow'
                    : 'text-[#baa894] hover:bg-[#261f19] hover:text-[#f2e7d5]'
                }`}
                title="Toggle Draggable Magnifying Glass Lens"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[11px] font-sans">
                  {isMagnifierActive ? 'Lens Active' : 'Inspect Lens'}
                </span>
              </button>

              <div className="h-4 w-px bg-[#362c23]" />

              <button
                onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.1))}
                className="p-1.5 rounded hover:bg-[#261f19] text-[#baa894] hover:text-[#f2e7d5]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-[#a1907d] w-9 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1.5 rounded hover:bg-[#261f19] text-[#baa894] hover:text-[#f2e7d5]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded hover:bg-[#261f19] text-[#baa894] hover:text-[#f2e7d5]"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Plate Core: Left Illustrated Canvas + Right Field Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: The Tactile Plate Canvas */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div
                ref={plateContainerRef}
                onMouseMove={handlePlateMouseMove}
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#544435] bg-[#0d0b09] shadow-2xl group cursor-crosshair"
              >
                {/* Plate Image */}
                <img
                  src={activePlate.image}
                  alt={activePlate.title}
                  className="w-full h-full object-cover object-center filter saturate-[1.1] contrast-[1.05] transition-transform duration-700 group-hover:scale-[1.02]"
                />

                {/* Subtle vignette and texture overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Botanical plate corner embellishments */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-[#ecd8be] bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-[#c98d48]/40">
                  {activePlate.plateNumber}
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-[#e8dbcc] pointer-events-none">
                  <span className="font-serif italic drop-shadow-md">
                    {activePlate.title}
                  </span>
                  <span className="font-sans text-[10px] text-[#e0b784] drop-shadow-md">
                    {activePlate.era}
                  </span>
                </div>

                {/* Real-time Magnifying Glass Lens overlay */}
                {isMagnifierActive && (
                  <div
                    className="pointer-events-none absolute w-44 h-44 rounded-full border-4 border-[#c98d48] shadow-[0_0_25px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(201,141,72,0.5)] overflow-hidden z-30"
                    style={{
                      left: `${magnifierPos.x}%`,
                      top: `${magnifierPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundImage: `url(${activePlate.image})`,
                      backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                      backgroundSize: '300% 300%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {/* Crosshairs & lens reflection */}
                    <div className="w-full h-full flex items-center justify-center opacity-40">
                      <div className="w-full h-px bg-[#c98d48]" />
                      <div className="h-full w-px bg-[#c98d48] absolute" />
                    </div>
                  </div>
                )}
              </div>

              {/* Plate Pagination Navigation */}
              <div className="w-full flex items-center justify-between mt-4 px-1">
                <button
                  onClick={handlePrevPlate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241e19] hover:bg-[#312922] text-[#dcd0bf] border border-[#44372c] text-xs font-sans transition-all hover:-translate-x-0.5"
                >
                  <ChevronLeft className="w-4 h-4 text-[#c98d48]" />
                  <span>Previous Plate</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {plates.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePlateIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === activePlateIndex
                          ? 'w-7 bg-[#c98d48]'
                          : 'bg-[#3e342a] hover:bg-[#665443]'
                      }`}
                      title={p.title}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextPlate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241e19] hover:bg-[#312922] text-[#dcd0bf] border border-[#44372c] text-xs font-sans transition-all hover:translate-x-0.5"
                >
                  <span>Next Plate</span>
                  <ChevronRight className="w-4 h-4 text-[#c98d48]" />
                </button>
              </div>
            </div>

            {/* Right: Scholar's Field Journal Notes & Heritage Dossier */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-[#151210] rounded-xl p-5 border border-[#3e3227] shadow-inner space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-[#c98d48]" />
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#b39570]">
                    Field Observation & Journal
                  </span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-[#ded4c5] font-body italic border-l-2 border-[#c98d48]/50 pl-3 py-1">
                  "{activePlate.journalNote}"
                </p>
              </div>

              {/* Key Mudra & Iconography */}
              <div className="bg-[#1e1916] rounded-lg p-3.5 border border-[#3c3127]">
                <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#d6aa75] mb-1">
                  Sacred Elements & Iconography
                </div>
                <div className="text-xs text-[#c5b8a6]">
                  {activePlate.mudraOrElement}
                </div>
              </div>

              {/* Action buttons connecting to the rest of the application */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={() => onSelectCulture?.(activePlate.cultureSlug)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#2b221a] hover:bg-[#3a2f24] text-[#f2e6d6] border border-[#5a4836] text-xs font-sans transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c98d48]" />
                    <span className="font-medium">
                      Explore Full {activePlate.title.split('—')[0]} Archive
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#c98d48] group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <button
                    onClick={onEnterExplorer}
                    className="px-3 py-2 text-xs font-sans font-semibold rounded-lg bg-[#c98d48] hover:bg-[#dca45d] text-[#13100e] transition-all shadow"
                  >
                    Watch Videos
                  </button>
                  <button
                    onClick={onEnterArtist}
                    className="px-3 py-2 text-xs font-sans font-medium rounded-lg bg-[#221c17] hover:bg-[#2c241e] text-[#d8c8b4] border border-[#483b2f] transition-all"
                  >
                    Artist Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Editorial Plate Index Drawer Modal */}
      {isIndexOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="relative w-full max-w-md h-full bg-[#181412] border-l border-[#43372c] p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#362c23] mb-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#f5ecd9]">
                    Editorial Index of Plates
                  </h3>
                  <p className="text-xs text-[#a69683]">
                    Nine Pillars of Indian Classical & Folk Heritage
                  </p>
                </div>
                <button
                  onClick={() => setIsIndexOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#261f1a] border border-[#44382c] flex items-center justify-center text-[#c5b8a6] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {plates.map((plate, index) => (
                  <div
                    key={plate.id}
                    onClick={() => {
                      setActivePlateIndex(index);
                      setIsIndexOpen(false);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                      index === activePlateIndex
                        ? 'bg-[#29221b] border-[#c98d48] text-white shadow-md'
                        : 'bg-[#1b1714] border-[#382e25] text-[#bdae9c] hover:border-[#63513f] hover:bg-[#221c18]'
                    }`}
                  >
                    <img
                      src={plate.image}
                      alt={plate.title}
                      className="w-12 h-12 object-cover rounded-md border border-[#4d3e31]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#c98d48]">
                          {plate.plateNumber}
                        </span>
                        <span className="text-[10px] text-[#867563]">
                          {plate.era}
                        </span>
                      </div>
                      <div className="font-serif text-sm truncate text-[#f2e7d7]">
                        {plate.title}
                      </div>
                      <div className="text-[11px] text-[#9a8976] truncate">
                        {plate.region}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#362c23] mt-6">
              <button
                onClick={() => {
                  setIsIndexOpen(false);
                  onEnterExplorer?.();
                }}
                className="w-full py-2.5 bg-[#c98d48] hover:bg-[#d89b56] text-[#120f0d] font-semibold font-sans text-xs rounded-lg transition-all"
              >
                Proceed to Culture Discovery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
