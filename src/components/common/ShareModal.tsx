import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n${text}\n${currentUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#181412] border-2 border-[#4c3c2e] rounded-2xl p-6 shadow-2xl text-[#ede5d8]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27201b] border border-[#3e3227] text-[#baa794] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-5 h-5 text-[#c98d48]" />
          <h3 className="font-serif text-xl text-[#f6eedf]">Share Cultural Heritage</h3>
        </div>

        <p className="text-xs text-[#baa794] mb-4 font-body leading-relaxed">
          {text}
        </p>

        <div className="flex items-center gap-2 bg-[#221c18] border border-[#3f3226] p-2.5 rounded-xl">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-xs text-[#baa794] truncate focus:outline-none font-mono"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#c98d48] hover:bg-[#d89b56] text-[#120f0d] font-semibold text-xs rounded-lg flex items-center gap-1 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
