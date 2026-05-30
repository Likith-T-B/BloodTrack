import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Droplet, 
  GitPullRequest, 
  AlertTriangle, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Calendar,
  History,
  CheckCircle,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define links based on Role
  const links = {
    admin: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/donors', label: 'Manage Donors', icon: Users },
      { path: '/admin/hospitals', label: 'Manage Hospitals', icon: Building2 },
      { path: '/admin/inventory', label: 'Blood Inventory', icon: Droplet },
      { path: '/admin/requests', label: 'Blood Requests', icon: GitPullRequest },
      { path: '/admin/alerts', label: 'Emergency Alerts', icon: AlertTriangle },
    ],
    donor: [
      { path: '/donor', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/donor/history', label: 'Donation History', icon: History },
      { path: '/donor/appointments', label: 'Book Appointment', icon: Calendar },
      { path: '/donor/eligibility', label: 'Eligibility Status', icon: CheckCircle },
    ],
    hospital: [
      { path: '/hospital', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/hospital/request', label: 'Request Blood', icon: GitPullRequest },
      { path: '/hospital/history', label: 'Track Requests', icon: FileText },
    ]
  };

  const currentLinks = links[user.role] || [];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 glass-dark text-slate-300 border-r border-slate-800">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/60">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg glow-red">
          <Droplet className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white font-poppins">BloodTrack</h1>
          <span className="text-[10px] text-red-500 font-semibold tracking-widest uppercase">Smart Blood Tracker</span>
        </div>
      </div>

      {/* User profile capsule in sidebar */}
      <div className="p-4 mx-4 my-6 rounded-2xl bg-slate-800/40 border border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-white font-bold font-poppins uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
            <span className="inline-flex items-center px-2 py-0.5 mt-1 text-[10px] font-semibold text-red-400 bg-red-950/40 border border-red-900/50 rounded-full capitalize">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Links Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
                  : 'hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / logout button */}
      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
