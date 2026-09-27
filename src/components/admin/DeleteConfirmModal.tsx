import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemType?: string;
  itemName: string;
  warningNote?: string;
  warningMessage?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Confirm Deletion',
  itemType = 'item',
  itemName,
  warningNote,
  warningMessage,
  onConfirm,
  onCancel,
  onClose,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const message = warningMessage || warningNote;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#181412] border-2 border-[#542d2a] rounded-2xl p-6 shadow-2xl text-[#ede5d8]">
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#27201b] border border-[#3e3227] text-[#baa794] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl text-[#fbeee0]">{title}</h3>
            <p className="text-xs text-[#a39281]">Irreversible action</p>
          </div>
        </div>

        <div className="space-y-3 text-xs mb-6">
          <p className="text-[#d8c8b6] leading-relaxed">
            Are you sure you want to delete this {itemType.toLowerCase()}?
          </p>
          <div className="p-3 rounded-lg bg-[#221a17] border border-[#3e2e28] font-mono text-[11px] text-[#f5ebd7] truncate font-medium">
            "{itemName}"
          </div>

          {message && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px] space-y-1">
              <span className="font-semibold block text-amber-300">⚠️ Relationship Warning:</span>
              <p>{message}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#31251f]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-[#251e19] hover:bg-[#342a23] text-xs text-[#d3c5b4] font-medium rounded-lg border border-[#44352a] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs text-white font-semibold rounded-lg shadow-md transition-all active:scale-98"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
