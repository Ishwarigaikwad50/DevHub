import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Shield, LogOut, CheckCheck, ExternalLink, Activity } from 'lucide-react';
import RoleBadge from '../common/RoleBadge';
import api from '../../api/client';

export const TopNavbar = ({ onOpenSearch }) => {
  const { user, logout, demoLogin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Shortcut Button */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all max-w-md w-full sm:w-80 text-left group shadow-sm"
      >
        <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
        <span className="text-xs flex-1">Quick search catalog...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Quick Switcher Pill (Developer Platform Testing) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-500 font-medium text-[11px] px-1">Role:</span>
          {['ADMIN', 'TEAM_ADMIN', 'DEVELOPER', 'VIEWER'].map((r) => (
            <button
              key={r}
              onClick={() => demoLogin(r)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                user?.role === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r === 'TEAM_ADMIN' ? 'TEAM LEAD' : r}
            </button>
          ))}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-400 font-bold border border-blue-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkRead(n._id)}
                      className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-800/60 ${
                        !n.isRead ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-white">{n.title}</div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400 line-clamp-2">{n.message}</div>
                      <div className="mt-1 text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 pl-2 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Dev'}`}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">{user?.name || 'Developer'}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{user?.role}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="p-3 border-b border-slate-800">
                <div className="text-sm font-semibold text-white">{user?.name}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
                <div className="mt-2">
                  <RoleBadge role={user?.role} size="sm" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
