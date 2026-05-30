import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { AlertTriangle, PlusCircle, CheckCircle, Activity, Megaphone } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Broadcast fields
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsNeeded, setUnitsNeeded] = useState(5);
  const [city, setCity] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [message, setMessage] = useState('');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/blood-stock/alerts');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    try {
      const res = await api.post('/blood-stock/alerts', {
        bloodGroup,
        unitsNeeded: parseInt(unitsNeeded),
        city,
        hospitalName,
        message
      });

      if (res.data.success) {
        setFormSuccess(res.data.message);
        // Clear fields
        setCity('');
        setHospitalName('');
        setMessage('');
        fetchAlerts();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to trigger broadcast');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideup text-left">
      {/* List Active Broadcasts */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-red-600 animate-pulse" />
              Active Emergency Broadcasts
            </h2>
            <span className="text-xs font-semibold text-slate-400">{alerts.length} active alerts</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
            ) : alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                No active emergency broadcasts running
              </div>
            ) : (
              alerts.map((al) => (
                <div key={al.id} className="p-5 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                    {al.blood_group}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm font-poppins">{al.hospital_name}</h4>
                      <span className="text-[9px] text-slate-400 font-semibold">{new Date(al.created_at || al.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-red-700 font-bold">{al.city} — Urgent need of {al.units_needed} units</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">{al.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid Right: Trigger form */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-24">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
              Trigger Emergency Alert
            </h2>
            <p className="text-xs text-slate-400">Notifies compatible matching eligible donors immediately</p>
          </div>

          {formSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 font-bold text-xs rounded-xl flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm font-medium"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Units Required</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Target City</label>
              <input
                type="text"
                required
                placeholder="e.g. Chicago"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Requester Hospital</label>
              <input
                type="text"
                required
                placeholder="e.g. St. Mary General"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Broadcast Message Alert</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="We require emergency O+ blood for surgery requirement. Matchers please respond!"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 h-20"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-premium hover-scale transition-all flex items-center justify-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Emergency Broad</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
