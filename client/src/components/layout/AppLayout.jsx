import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import GlobalSearchModal from './GlobalSearchModal';
import { ChevronRight, Home } from 'lucide-react';

export const AppLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate dynamic breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Dynamic Breadcrumbs */}
        {pathSegments.length > 0 && (
          <div className="px-8 pt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Link to="/dashboard" className="hover:text-slate-200 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
            </Link>
            {pathSegments.map((segment, index) => {
              const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const isLast = index === pathSegments.length - 1;
              const formattedName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

              return (
                <React.Fragment key={url}>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  {isLast ? (
                    <span className="text-slate-200 font-medium truncate max-w-xs">{formattedName}</span>
                  ) : (
                    <Link to={url} className="hover:text-slate-200 transition-colors">
                      {formattedName}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command+K Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default AppLayout;
