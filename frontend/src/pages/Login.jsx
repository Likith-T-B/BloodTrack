import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success && result.user) {
      const userRole = result.user.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'donor') {
        navigate('/donor');
      } else if (userRole === 'hospital') {
        navigate('/hospital');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Invalid username or password');
    }
  };

  const autofill = (role) => {
    if (role === 'admin') {
      setEmail('admin@bloodbank.com');
      setPassword('admin123');
    } else if (role === 'donor') {
      setEmail('donor@bloodbank.com');
      setPassword('donor123');
    } else if (role === 'hospital') {
      setEmail('hospital@bloodbank.com');
      setPassword('hospital123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-3xl shadow-premium border border-white animate-slideup">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-lg glow-red mb-4">
            <Droplet className="w-6 h-6 text-white animate-pulse" />
          </Link>
          <h2 className="text-3xl font-extrabold font-poppins text-slate-900 tracking-tight">Portal Login</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Access secure healthcare logistics panel
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bloodbank.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-55/60 border border-slate-200 rounded-xl outline-none focus:border-red-500 font-medium text-sm transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 block mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-55/60 border border-slate-200 rounded-xl outline-none focus:border-red-500 font-medium text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-premium hover-scale transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Instant trial accounts for wowed user */}
        <div className="pt-6 border-t border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">
            Quick Trial Sandbox Accounts
          </p>
          <div className="flex justify-between gap-2">
            <button
              onClick={() => autofill('admin')}
              className="flex-1 py-2 px-2 border border-slate-200 hover:border-red-200 hover:bg-red-50/30 text-[10px] font-bold text-slate-600 hover:text-red-700 rounded-lg transition-all"
            >
              💼 Admin
            </button>
            <button
              onClick={() => autofill('donor')}
              className="flex-1 py-2 px-2 border border-slate-200 hover:border-red-200 hover:bg-red-50/30 text-[10px] font-bold text-slate-600 hover:text-red-700 rounded-lg transition-all"
            >
              🩸 Donor
            </button>
            <button
              onClick={() => autofill('hospital')}
              className="flex-1 py-2 px-2 border border-slate-200 hover:border-red-200 hover:bg-red-50/30 text-[10px] font-bold text-slate-600 hover:text-red-700 rounded-lg transition-all"
            >
              🏥 Hospital
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          New to BloodTrack?{' '}
          <Link to="/register" className="text-red-600 font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
