import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { GitPullRequest, Search, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (id, status, reason = '') => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.put(`/requests/${id}/status`, { status, reason });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        fetchRequests();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error processing request');
    }
  };

  const filteredRequests = filterPriority 
    ? requests.filter(r => r.priority === filterPriority)
    : requests;

  return (
    <div className="space-y-6 animate-slideup text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-poppins text-slate-800 tracking-tight flex items-center gap-2">
            <GitPullRequest className="w-7 h-7 text-red-600" />
            Hospital Blood Requests
          </h1>
          <p className="text-slate-500 font-medium">Verify priority metrics and approve stock allocation</p>
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none shadow-sm focus:border-red-500"
        >
          <option value="">All Priority Levels...</option>
          <option value="critical">Critical Priority Only</option>
          <option value="emergency">Emergency Priority Only</option>
          <option value="normal">Normal Priority Only</option>
        </select>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 font-bold text-xs rounded-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Requests Ledger card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base font-poppins text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            Active Hospital Demands Workflow
          </h3>
          <span className="text-xs font-semibold text-slate-400">{filteredRequests.length} requests</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No hospital requests logged</div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 pr-4">Hospital Name</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Required Quantity</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-bold text-slate-800">{req.hospitalName}</div>
                      <div className="text-[10px] text-slate-400">Required: {new Date(req.required_before).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-xs">
                        {req.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-800">{req.units_requested} Units</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        req.priority === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : req.priority === 'emergency' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-slate-100 text-slate-550'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        req.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : req.status === 'approved'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleProcess(req.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please enter rejection reason:');
                              if (reason !== null) handleProcess(req.id, 'rejected', reason);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Processed</span>
                      )}
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

export default Requests;
