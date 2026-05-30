import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { GitPullRequest, Search, FileText, CheckCircle2 } from 'lucide-react';

const TrackRequests = () => {
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
        console.error('Error fetching requests:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6 animate-slideup text-left">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Track Hospital Logistics Requests
          </h2>
          <span className="text-xs font-semibold text-slate-400">{requests.length} requests logged</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No historical requests found
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Quantity Requested</th>
                  <th className="py-3 px-4">Required Before</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4 text-xs font-bold text-slate-500">#ORD-{1000 + req.id}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-xs">
                        {req.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{req.units_requested} Units</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{new Date(req.required_before).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                        req.priority === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : req.priority === 'emergency' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                        req.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : req.status === 'approved'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-xs text-slate-400 max-w-xs truncate" title={req.reason}>
                      {req.reason || 'None specified'}
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

export default TrackRequests;
