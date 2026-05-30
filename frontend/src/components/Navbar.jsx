import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, MapPin, User, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, notifications, markNotificationRead, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/80">
      {/* Search or greeting */}
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold font-poppins text-slate-800">
          Welcome back, <span className="text-primary font-extrabold">{(user?.name || 'User').split(' ')[0]}</span> 👋
        </h2>
        <span className="hidden sm:inline-flex items-center gap-1 ml-4 px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-full">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {user.city || 'Central Hub'}
        </span>
      </div>

      {/* Action utilities */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl z-50 animate-slideup">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="font-bold text-sm text-slate-800">Recent Notifications</h3>
                <span className="text-xs font-medium text-slate-400">{unreadCount} unread</span>
              </div>

              <div className="divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 transition-colors ${!notif.is_read ? 'bg-red-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <h4 className={`text-xs font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 mt-2 block">
                            {new Date(notif.created_at || notif.date).toLocaleDateString()}
                          </span>
                        </div>
                        {!notif.is_read && (
                          <button
                            onClick={() => markNotificationRead(notif.id)}
                            className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick User Actions */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-primary font-bold">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-3">{user.name}</p>
            <span className="text-[10px] text-slate-400 font-medium capitalize">{user.role} Portal</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
