import React from 'react';
import { Culture } from '../../types';
import { Card3D } from '../common/Card3D';
import { MapPin, ArrowRight } from 'lucide-react';

interface CultureCardProps {
  culture: Culture;
  onClick: () => void;
}

export const CultureCard: React.FC<CultureCardProps> = ({ culture, onClick }) => {
  return (
    <Card3D
      onClick={onClick}
      className="bg-[#191512] border border-[#3e3226] hover:border-[#c98d48] shadow-xl group"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <img
          src={culture.imagePlate}
          alt={culture.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191512] via-transparent to-black/30" />

        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[#e4b57d] border border-[#c98d48]/40">
            {culture.category}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-[11px] text-[#9c8a77] font-sans">
          <MapPin className="w-3 h-3 text-[#c98d48]" />
          <span className="truncate">{culture.region}</span>
        </div>

        <h3 className="font-serif text-xl text-[#f5ebd7] group-hover:text-[#f8c88f] transition-colors leading-tight">
          {culture.name}
        </h3>

        <p className="text-xs text-[#b8a693] line-clamp-2 leading-relaxed font-body">
          {culture.overview}
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-[#2d231b] text-xs font-sans">
          <span className="text-[#caa578] font-serif italic text-xs">
            {culture.canonicalName.split('(')[0]}
          </span>
          <span className="text-[#c98d48] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Card3D>
  );
};
