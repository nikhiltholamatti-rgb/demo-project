import React from 'react';
import { X, Bell, Check, Calendar, Heart, Shield, MessageCircle } from 'lucide-react';
import { db } from '../../lib/supabase';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  notifications: NotificationItem[];
  onOpenAppointments?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  notifications,
  onOpenAppointments,
}) => {
  if (!isOpen) return null;

  const handleMarkAll = () => {
    db.notifications.markAllAsRead(userId);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[#c98d48]" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-amber-300" />;
      case 'verification':
      default:
        return <Shield className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-sm h-full bg-[#171310] border-l border-[#43372c] p-5 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#362c23] mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#c98d48]" />
              <h3 className="font-serif text-xl text-[#f5ebd7]">Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={handleMarkAll}
                  className="text-[11px] font-sans text-[#c98d48] hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-full text-[#9c8b78] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-[#8a7b6b]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    db.notifications.markAsRead(item.id);
                    if (item.type === 'appointment') {
                      onOpenAppointments?.();
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-[#1e1915] border-[#362c23] text-[#aaa]'
                      : 'bg-[#261f19] border-[#c98d48]/50 text-[#ede4d5] shadow'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#14110e] border border-[#3f3429] mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-[#f2e5d4] truncate">
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-[#c98d48]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#b3a391] mt-0.5 leading-snug">
                        {item.message}
                      </p>
                      <span className="text-[9px] font-mono text-[#7a6c5e] mt-1 block">
                        {new Date(item.createdAt).toLocaleDateString()} at{' '}
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#342921]">
          <p className="text-[10px] text-center text-[#756658]">
            GanaKala Loka Cultural Notification Dispatch
          </p>
        </div>
      </div>
    </div>
  );
};
