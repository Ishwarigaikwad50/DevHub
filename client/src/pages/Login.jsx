import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Shield, Crown, Code, Eye, ArrowRight, Lock, Mail, User } from 'lucide-react';
import RoleBadge from '../components/common/RoleBadge';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (isRegister) {
      res = await register({ name, email, password, title });
    } else {
      res = await login(email, password);
    }
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    const res = await demoLogin(role);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const demoProfiles = [
    {
      role: 'ADMIN',
      name: 'Alex Rivera',
      title: 'Staff Platform Architect',
      email: 'admin@devhub.io',
      icon: Crown,
      color: 'from-rose-600/30 to-rose-950/40 border-rose-800/60 hover:border-rose-500',
      badgeColor: 'rose'
    },
    {
      role: 'TEAM_ADMIN',
      name: 'Sarah Chen',
      title: 'Payments Engineering Lead',
      email: 'teamlead@devhub.io',
      icon: Shield,
      color: 'from-purple-600/30 to-purple-950/40 border-purple-800/60 hover:border-purple-500',
      badgeColor: 'purple'
    },
    {
      role: 'DEVELOPER',
      name: 'Marcus Vance',
      title: 'Senior Backend Engineer',
      email: 'developer@devhub.io',
      icon: Code,
      color: 'from-blue-600/30 to-blue-950/40 border-blue-800/60 hover:border-blue-500',
      badgeColor: 'blue'
    },
    {
      role: 'VIEWER',
      name: 'Elena Rostova',
      title: 'Product Operations Analyst',
      email: 'viewer@devhub.io',
      icon: Eye,
      color: 'from-slate-700/30 to-slate-900/40 border-slate-700/60 hover:border-slate-500',
      badgeColor: 'slate'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Overview & 1-Click Demo Logins */}
        <div className="md:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/20 text-white font-bold text-lg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">DevHub</h1>
              <p className="text-xs text-slate-400 font-mono">Internal Developer Service Catalog</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Centralized platform for microservices, APIs, and dependencies.
            </h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Explore service architecture, trace upstream/downstream dependencies, inspect API specifications, and monitor real-time health telemetry.
            </p>
          </div>

          {/* Quick 1-Click Role Logins */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick 1-Click Demo Profiles
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoProfiles.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.role}
                    onClick={() => handleDemoClick(p.role)}
                    disabled={loading}
                    className={`p-3 rounded-2xl bg-gradient-to-b ${p.color} border transition-all duration-200 text-left group shadow-lg flex flex-col justify-between hover:scale-[1.02]`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <RoleBadge role={p.role} size="sm" />
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="mt-2 text-xs font-bold text-white leading-tight">{p.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{p.title}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 font-semibold group-hover:text-blue-300">
                      <span>Log in as {p.role === 'TEAM_ADMIN' ? 'Lead' : p.role}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Traditional Login / Register Form */}
        <div className="md:col-span-6">
          <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{isRegister ? 'Create Account' : 'Sign In'}</h3>
                <p className="text-xs text-slate-400">
                  {isRegister ? 'Register your developer profile' : 'Enter your organization credentials'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                {isRegister ? 'Have an account? Login' : 'Need an account? Register'}
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@devhub.io"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : isRegister ? 'Register' : 'Sign In to DevHub'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 text-center">
                Demo password for seeded accounts: <span className="font-mono text-slate-200 font-semibold">Password123!</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
