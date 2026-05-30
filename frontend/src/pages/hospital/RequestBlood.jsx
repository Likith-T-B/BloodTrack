import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { GitPullRequest, ShieldCheck, Heart, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RequestBlood = () => {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsRequested, setUnitsRequested] = useState(2);
  const [priority, setPriority] = useState('normal');
  const [requiredBefore, setRequiredBefore] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/requests', {
        bloodGroup,
        unitsRequested: parseInt(unitsRequested),
        priority,
        requiredBefore,
        reason
      });

      if (res.data.success) {
        setSuccess(res.data.message);
        // Navigate back to history after success delay
        setTimeout(() => {
          navigate('/hospital/history');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slideup text-left">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-red-600 animate-bounce" />
            Initiate Blood request
          </h2>
          <p className="text-xs text-slate-400">Triggers admin workflow checks and stock adjustments</p>
        </div>

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 font-bold text-xs rounded-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Blood Group Type</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm font-medium"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Quantity Requested (Units)</label>
              <input
                type="number"
                min="1"
                required
                value={unitsRequested}
                onChange={(e) => setUnitsRequested(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm font-medium"
              >
                <option value="normal">Normal Priority</option>
                <option value="emergency">Emergency Priority</option>
                <option value="critical">Critical (Immediate Callout)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Due Date required</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={requiredBefore}
                onChange={(e) => setRequiredBefore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Clinical Requirement Reason</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Surgery case #8892 requirements. Immediate compatible supply needed."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 h-24"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-premium hover-scale transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <AlertOctagon className="w-4 h-4" />
                <span>Transmit Blood Order Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestBlood;
