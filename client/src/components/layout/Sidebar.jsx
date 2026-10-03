import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Server,
  Code2,
  Users2,
  Globe2,
  GitFork,
  Rocket,
  Activity,
  UserCog,
  FileSpreadsheet,
  Terminal,
  Layers
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const navigation = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Catalog',
      items: [
        { name: 'Services', path: '/services', icon: Server },
        { name: 'APIs', path: '/apis', icon: Code2 },
        { name: 'Teams', path: '/teams', icon: Users2 }
      ]
    },
    {
      group: 'Infrastructure',
      items: [
        { name: 'Environments', path: '/environments', icon: Globe2 },
        { name: 'Dependencies', path: '/dependencies', icon: GitFork },
        { name: 'Deployments', path: '/deployments', icon: Rocket }
      ]
    },
    {
      group: 'Monitoring',
      items: [
        { name: 'Service Health', path: '/health', icon: Activity }
      ]
    },
    {
      group: 'Administration',
      items: [
        ...(isAdmin ? [{ name: 'Users', path: '/users', icon: UserCog }] : []),
        { name: 'Audit Logs', path: '/audit-logs', icon: FileSpreadsheet }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-base">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            DevHub
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              v2.0
            </span>
          </span>
          <div className="text-[10px] text-slate-400 font-mono">Service Catalog Platform</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.group}>
            <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {section.group}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status Banner */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 m-3 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-xs font-medium text-slate-300">Catalog Engine</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
            ONLINE
          </span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">Autonomous Probes Active</div>
      </div>
    </aside>
  );
};

export default Sidebar;
