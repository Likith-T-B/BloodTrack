import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { GitPullRequest, ShieldCheck, Activity, Calendar, Droplet, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests');
        if (res.data.success) {
          setRequests(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching hospital dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (!user || !user.details) return null;

  const hospitalDetails = user.details;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-8 animate-slideup text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-poppins text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-red-600 animate-pulse" />
            Hospital Logistics Dashboard
          </h1>
          <p className="text-slate-500 font-medium">Coordinate emergency orders and track blood shipments in real-time.</p>
        </div>

        <Link
          to="/hospital/request"
          className="px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-premium hover-scale transition-all"
        >
          Initiate Blood Request
        </Link>
      </div>

      {/* Hospital metadata summary card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 font-medium text-xs text-slate-600">
        <div className="space-y-1">
          <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Facility Type</span>
          <h4 className="text-sm font-extrabold text-slate-800 uppercase">{hospitalDetails.hospital_type || 'Private facility'}</h4>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Operations License ID</span>
          <h4 className="text-sm font-extrabold text-slate-800 inline-flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            {hospitalDetails.license_number}
          </h4>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Emergency Contact Hotline</span>
          <h4 className="text-sm font-black text-red-600">{hospitalDetails.emergency_contact}</h4>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Requests Logged</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{requests.length} Requests</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approval</span>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{pendingRequests} Pending</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved & Allocated</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{approvedRequests} Orders</h3>
        </div>
      </div>

      {/* Requests Ledger grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base font-poppins text-slate-800">Your Logistics History Ledger</h3>
          <Link to="/hospital/history" className="text-xs font-bold text-red-600 hover:underline">View All Ledger</Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No blood requests logged. Press initiate button above!</div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Quantity Ordered</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4 text-xs font-bold text-slate-500">#ORD-{1000 + req.id}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-xs">
                        {req.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-850">{req.units_requested} Units</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                        req.priority === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : req.priority === 'emergency' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                        req.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse'
                          : req.status === 'approved'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
