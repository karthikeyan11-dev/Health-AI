import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Menu,
  X,
  User,
  HeartPulse,
  Heart,
  Brain,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  LogOut,
  Dna,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';

export function PatientLayout(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [assessmentsOpen, setAssessmentsOpen] = useState(true);

  const handleLogout = (): void => {
    storage.removeToken();
    navigate('/login', { replace: true });
  };

  const isAssessmentsActive = location.pathname.startsWith('/assessments');

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#083032] antialiased selection:bg-[#083032] selection:text-white">
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between p-4 bg-[#083032] text-white border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <HeartPulse className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Health AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Full-Height Collapsible Static Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-[#083032] text-white flex flex-col justify-between transition-all duration-300 ease-in-out lg:static lg:translate-x-0 h-full shrink-0 overflow-y-auto select-none custom-scrollbar',
          collapsed ? 'w-20 px-2 py-5' : 'w-72 p-6',
          mobileOpen ? 'translate-x-0 w-72 p-6' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="space-y-6">
          {/* Brand Header with Toggle Icon */}
          <div
            className={cn(
              'flex items-center border-b border-white/10 pb-4 transition-all duration-300',
              collapsed ? 'flex-col justify-center gap-3 px-0' : 'justify-between gap-2',
            )}
          >
            <div
              className={cn(
                'flex items-center gap-3 min-w-0',
                collapsed && 'justify-center w-full',
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
                <HeartPulse className="w-6 h-6 text-emerald-400" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xl tracking-tight text-white block truncate">
                    Health AI
                  </span>
                  <p className="text-xs text-white/70 truncate">Patient Health Portal</p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all shrink-0 hidden lg:flex items-center justify-center',
                collapsed ? 'w-9 h-9 border border-white/15' : 'p-1.5',
              )}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-emerald-300" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-emerald-300" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-[11px] font-bold tracking-wider text-white/50 uppercase px-3 mb-2">
                Navigation
              </p>
            )}
            <nav className="space-y-1">
              {/* Overview */}
              <NavLink
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                title={collapsed ? 'Overview' : undefined}
                className={cn(
                  'flex items-center rounded-xl text-sm font-medium transition-all duration-200 group',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
                  location.pathname === '/dashboard'
                    ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/10 backdrop-blur-md'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                <LayoutDashboard
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    location.pathname === '/dashboard'
                      ? 'text-emerald-400'
                      : 'text-white/60 group-hover:text-white',
                  )}
                />
                {!collapsed && <span className="truncate">Overview</span>}
              </NavLink>

              {/* Health Monitoring */}
              <NavLink
                to="/health-monitoring"
                onClick={() => setMobileOpen(false)}
                title={collapsed ? 'Health Monitoring' : undefined}
                className={cn(
                  'flex items-center rounded-xl text-sm font-medium transition-all duration-200 group',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
                  location.pathname === '/health-monitoring'
                    ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/10 backdrop-blur-md'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                <Activity
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    location.pathname === '/health-monitoring'
                      ? 'text-emerald-400'
                      : 'text-white/60 group-hover:text-white',
                  )}
                />
                {!collapsed && <span className="truncate">Health Monitoring</span>}
              </NavLink>

              {/* Patient Digital Twin */}
              <NavLink
                to="/digital-twin"
                onClick={() => setMobileOpen(false)}
                title={collapsed ? 'Digital Twin' : undefined}
                className={cn(
                  'flex items-center rounded-xl text-sm font-medium transition-all duration-200 group',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
                  location.pathname === '/digital-twin'
                    ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/10 backdrop-blur-md'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                <Dna
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    location.pathname === '/digital-twin'
                      ? 'text-emerald-400'
                      : 'text-white/60 group-hover:text-white',
                  )}
                />
                {!collapsed && <span className="truncate">Digital Twin</span>}
              </NavLink>

              {/* Section 3: AI Assessments Dropdown Group */}
              <div className="pt-2">
                {!collapsed ? (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setAssessmentsOpen(!assessmentsOpen)}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
                        isAssessmentsActive ? 'text-emerald-300' : 'text-white/60 hover:text-white',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-emerald-400" />
                        <span>AI Assessments</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          assessmentsOpen ? 'rotate-180' : '',
                        )}
                      />
                    </button>

                    {assessmentsOpen && (
                      <div className="pl-3 space-y-1 border-l-2 border-white/10 ml-4 mt-1">
                        {/* Cardiovascular Risk */}
                        <NavLink
                          to="/assessments/cardiovascular"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group',
                            location.pathname === '/assessments/cardiovascular'
                              ? 'bg-white/15 text-white shadow-inner border border-white/10 backdrop-blur-md font-bold'
                              : 'text-white/70 hover:bg-white/10 hover:text-white',
                          )}
                        >
                          <Heart
                            className={cn(
                              'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                              location.pathname === '/assessments/cardiovascular'
                                ? 'text-rose-400'
                                : 'text-white/50 group-hover:text-rose-400',
                            )}
                          />
                          <span className="truncate">Cardiovascular Risk</span>
                        </NavLink>

                        {/* Stress Assessment */}
                        <NavLink
                          to="/assessments/stress"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group',
                            location.pathname === '/assessments/stress'
                              ? 'bg-white/15 text-white shadow-inner border border-white/10 backdrop-blur-md font-bold'
                              : 'text-white/70 hover:bg-white/10 hover:text-white',
                          )}
                        >
                          <Brain
                            className={cn(
                              'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                              location.pathname === '/assessments/stress'
                                ? 'text-indigo-400'
                                : 'text-white/50 group-hover:text-indigo-400',
                            )}
                          />
                          <span className="truncate">Stress Assessment</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <NavLink
                      to="/assessments/cardiovascular"
                      onClick={() => setMobileOpen(false)}
                      title="Cardiovascular Risk"
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all group',
                        location.pathname === '/assessments/cardiovascular'
                          ? 'bg-white/15 text-white shadow-inner border border-white/10'
                          : 'text-white/75 hover:bg-white/10',
                      )}
                    >
                      <Heart
                        className={cn(
                          'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                          location.pathname === '/assessments/cardiovascular'
                            ? 'text-rose-400'
                            : 'text-white/60',
                        )}
                      />
                    </NavLink>
                    <NavLink
                      to="/assessments/stress"
                      onClick={() => setMobileOpen(false)}
                      title="Stress Assessment"
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all group',
                        location.pathname === '/assessments/stress'
                          ? 'bg-white/15 text-white shadow-inner border border-white/10'
                          : 'text-white/75 hover:bg-white/10',
                      )}
                    >
                      <Brain
                        className={cn(
                          'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                          location.pathname === '/assessments/stress'
                            ? 'text-indigo-400'
                            : 'text-white/60',
                        )}
                      />
                    </NavLink>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* User Account Section */}
        <div className="pt-4 border-t border-white/10 mt-6 flex flex-col gap-2">
          {!collapsed ? (
            <div className="w-full space-y-2">
              <p className="text-[11px] font-bold tracking-wider text-white/50 uppercase px-3 mb-1">
                User Account
              </p>
              <NavLink
                to="/profile"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/15 hover:border-emerald-400/40 transition-all duration-200 cursor-pointer group"
                title="View Profile"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-emerald-300 transition-colors">
                    Patient Profile
                  </p>
                </div>
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all duration-200 cursor-pointer group text-xs font-semibold"
                title="Log Out"
              >
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <NavLink
                to="/profile"
                className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-sm shrink-0 hover:scale-110 hover:border-emerald-400 transition-all cursor-pointer"
                title="View Profile"
              >
                <User className="w-5 h-5 text-emerald-400" />
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 relative">
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}
    </div>
  );
}
