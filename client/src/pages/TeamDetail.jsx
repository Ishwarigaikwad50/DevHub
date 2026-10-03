import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users2, Server, Code2, History, Mail, MessageSquare, User, ExternalLink, ArrowRight } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import CriticalityBadge from '../components/common/CriticalityBadge';
import MethodBadge from '../components/common/MethodBadge';
import RoleBadge from '../components/common/RoleBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export const TeamDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  const fetchTeamData = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading team structure & services..." size="lg" />;
  }

  if (!data || !data.team) {
    return <EmptyState icon={Users2} title="Team Not Found" description="The requested team does not exist." />;
  }

  const { team, services, apis, activity } = data;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Team Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <Users2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white">{team.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                  {team.key}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 max-w-2xl">{team.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {team.slackChannel && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>{team.slackChannel}</span>
              </div>
            )}
            {team.contactEmail && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>{team.contactEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'services', name: `Owned Services (${services.length})`, icon: Server },
            { id: 'members', name: `Members (${team.members?.length || 0})`, icon: User },
            { id: 'apis', name: `Team APIs (${apis.length})`, icon: Code2 },
            { id: 'activity', name: `Recent Activity (${activity.length})`, icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}

      {/* 1. Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {services.length === 0 ? (
            <EmptyState icon={Server} title="No services owned" description="This team does not currently own any registered services." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div key={svc._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <Link to={`/services/${svc._id}`} className="text-sm font-bold text-white hover:text-blue-400">
                            {svc.name}
                          </Link>
                          <div className="text-[11px] font-mono text-slate-400">{svc.key}</div>
                        </div>
                      </div>
                      <StatusBadge status={svc.status} size="sm" />
                    </div>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">{svc.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <CriticalityBadge criticality={svc.criticality} size="sm" />
                    <Link
                      to={`/services/${svc._id}`}
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {team.members?.length === 0 ? (
            <EmptyState icon={User} title="No members assigned" description="Add engineering staff to this squad." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.members.map((member) => (
                <div key={member._id} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <img
                    src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.name}`}
                    alt={member.name}
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">{member.name}</div>
                    <div className="text-xs text-slate-400 truncate">{member.title || 'Engineer'}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <RoleBadge role={member.role} size="sm" />
                      {team.lead?._id === member._id && (
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-900">
                          Squad Lead
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Team APIs Tab */}
      {activeTab === 'apis' && (
        <div className="space-y-4">
          {apis.length === 0 ? (
            <EmptyState icon={Code2} title="No APIs exposed by team services" description="APIs will show up once services define endpoints." />
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Method & Endpoint</th>
                    <th className="px-4 py-3.5">Service</th>
                    <th className="px-4 py-3.5">Version</th>
                    <th className="px-4 py-3.5">Auth</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {apis.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-900/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <MethodBadge method={item.method} size="sm" />
                          <span className="font-bold text-white font-mono">{item.endpoint}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/services/${item.service?._id}`} className="text-blue-400 hover:underline">
                          {item.service?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">{item.version}</td>
                      <td className="px-4 py-3.5 text-slate-300">{item.authRequired ? 'Required' : 'Public'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/apis?id=${item._id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px]"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          {activity.length === 0 ? (
            <EmptyState icon={History} title="No activity recorded" description="Team changes will be logged here." />
          ) : (
            activity.map((log) => (
              <div key={log._id} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs">
                <img
                  src={log.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.user?.name}`}
                  alt="user"
                  className="w-6 h-6 rounded-full border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200">
                    <span className="font-bold text-white">{log.user?.name || 'Operator'}</span>
                    <span className="text-slate-400"> performed </span>
                    <span className="font-mono text-blue-400 font-semibold">{log.action}</span>
                    <span className="text-slate-400"> on </span>
                    <span className="font-medium text-slate-300">{log.entityName || log.entity}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TeamDetail;
