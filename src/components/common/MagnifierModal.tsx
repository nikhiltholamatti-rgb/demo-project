import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface MagnifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  notes?: string;
}

export const MagnifierModal: React.FC<MagnifierModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  notes,
}) => {
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState(2.5);

  if (!isOpen) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#1a1613] border-2 border-[#544333] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-[#3d3227] mb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#c98d48] uppercase">
              Micro-Detail & Mudra Lens
            </span>
            <h3 className="font-serif text-2xl text-[#f3ebd9]">{title}</h3>
            {subtitle && <p className="text-xs text-[#a99986]">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1.8, z - 0.5))}
              className="p-1.5 rounded-lg bg-[#27201a] border border-[#43362a] text-[#baa894] hover:text-white"
              title="Zoom out lens"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#c98d48]">{zoomLevel}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(4, z + 0.5))}
              className="p-1.5 rounded-lg bg-[#27201a] border border-[#43362a] text-[#baa894] hover:text-white"
              title="Zoom in lens"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#27201a] border border-[#43362a] text-[#baa894] hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive inspection area */}
        <div
          onMouseMove={handleMouseMove}
          className="relative w-full aspect-[16/10] bg-[#0d0b09] rounded-xl overflow-hidden border border-[#44372c] cursor-crosshair"
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Draggable Magnifier Loupe */}
          <div
            className="pointer-events-none absolute w-48 h-48 rounded-full border-4 border-[#c98d48] shadow-[0_0_30px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(201,141,72,0.4)] overflow-hidden"
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
              backgroundSize: `${zoomLevel * 100}% ${zoomLevel * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="w-full h-full flex items-center justify-center opacity-30">
              <div className="w-full h-px bg-[#c98d48]" />
              <div className="h-full w-px bg-[#c98d48] absolute" />
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-4 p-3 bg-[#13100e] border border-[#382d23] rounded-lg text-xs text-[#c4b5a3] font-body italic">
            "{notes}"
          </div>
        )}
      </div>
    </div>
  );
};
