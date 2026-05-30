import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, 
  Building2, 
  Droplet, 
  GitPullRequest, 
  AlertTriangle, 
  Check, 
  X,
  PlusCircle,
  Activity,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError('Failed to fetch admin stats');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRequestApproval = async (id, status) => {
    try {
      setActionSuccess('');
      const res = await api.put(`/requests/${id}/status`, { status });
      if (res.data.success) {
        setActionSuccess(res.data.message);
        fetchAnalytics();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, stockSummary, demandTrends, recentDonations, recentRequests } = data || {};

  // Check for critical stock alerts
  const lowStockAlerts = stockSummary?.filter(s => s.units < s.minRequired) || [];

  return (
    <div className="space-y-8 animate-slideup text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-poppins text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-red-600 animate-pulse" />
            Executive Admin Portal
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time health inventory aggregates & request approvals</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 font-semibold text-xs rounded-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-semibold text-xs rounded-xl flex items-center gap-2">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Critical Stock Warners Ticker */}
      {lowStockAlerts.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl flex items-start gap-3 shadow-premium">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0 animate-bounce" />
          <div>
            <h4 className="font-bold text-sm font-poppins">Critical Shortage Warning (Low Stock)</h4>
            <p className="text-xs text-yellow-700 mt-1">
              The following blood groups are currently below the required safety threshold: {' '}
              {lowStockAlerts.map(l => (
                <span key={l.bloodGroup} className="inline-flex items-center px-2 py-0.5 ml-1.5 rounded-lg text-xs font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                  {l.bloodGroup} ({l.units}/{l.minRequired} units)
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Donors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Donors</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{summary?.totalDonors}</h3>
          <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 mt-2">
            <ArrowUpRight className="w-3 h-3" />
            100% Eligible
          </span>
        </div>

        {/* Card 2: Total Hospitals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connected Hospitals</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{summary?.totalHospitals}</h3>
          <span className="text-[10px] text-slate-400 font-semibold flex items-center mt-2">
            Licensed operations
          </span>
        </div>

        {/* Card 3: Stock Units */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Stock</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{summary?.totalAvailableUnits}</h3>
          <span className="text-[10px] font-semibold text-slate-400 mt-2 block">
            Aggregated units in reserve
          </span>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Requests</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{summary?.pendingRequests}</h3>
          <span className="text-[10px] text-red-500 font-bold flex items-center mt-2 animate-pulse">
            🚨 Requires urgent action
          </span>
        </div>
      </div>

      {/* Advanced Recharts Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plot 1: Blood Inventory Levels */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base font-poppins text-slate-800">Inventory Levels vs Threshold</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">A+, A-, B+, B-, etc.</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                <Bar name="Current Stock Units" dataKey="units" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar name="Minimum Threshold" dataKey="minRequired" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: Demand Trends */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base font-poppins text-slate-800">Cumulative Requests Demand Trend</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Requests by group</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                <Line name="Requests Frequency" type="monotone" dataKey="requestsCount" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action and Recent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grid Left: Live Pending Request Approvals (Workflow) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base font-poppins text-slate-800">Direct Pending Approvals Workflow</h3>
            <span className="text-xs font-bold text-slate-400">Action panel</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRequests?.filter(r => r.status === 'pending').length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                All requests processed successfully. Good job! 🎉
              </div>
            ) : (
              recentRequests?.filter(r => r.status === 'pending').map((req) => (
                <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">{req.hospitalName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        req.priority === 'critical' 
                          ? 'bg-red-100 text-red-700 glow-red' 
                          : req.priority === 'emergency' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Requires <span className="text-red-600 font-extrabold">{req.units} units</span> of compatible <span className="font-bold text-slate-800">{req.bloodGroup}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRequestApproval(req.id, 'approved')}
                      className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      title="Approve request"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRequestApproval(req.id, 'rejected')}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Reject request"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grid Right: Recent Donation Log */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base font-poppins text-slate-800">Recent Donations Intake</h3>
            <span className="text-xs font-bold text-slate-400">Audit log</span>
          </div>

          <div className="space-y-4">
            {recentDonations?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent donation intakes
              </div>
            ) : (
              recentDonations?.map((don) => (
                <div key={don.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black text-xs">
                    {don.bloodGroup}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">{don.donorName}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(don.donationDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-extrabold text-green-600">+{don.units} Unit</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
