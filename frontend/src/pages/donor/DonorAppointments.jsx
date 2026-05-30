import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, Clock, CheckCircle2, ShieldAlert, Heart } from 'lucide-react';

const DonorAppointments = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/donors/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/donors/appointment', {
        appointmentDate: date,
        appointmentTime: time
      });

      if (res.data.success) {
        setSuccess(res.data.message);
        setDate('');
        fetchAppointments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideup text-left">
      {/* Form Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600 animate-bounce" />
            Book Donation Visit
          </h2>
          <p className="text-xs text-slate-400">Select standard screening slot</p>
        </div>

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 animate-pulse" />
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
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Select Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Select Time Slot</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 font-medium"
            >
              <option value="09:00">09:00 AM - 10:00 AM</option>
              <option value="10:00">10:00 AM - 11:00 AM</option>
              <option value="11:00">11:00 AM - 12:00 PM</option>
              <option value="14:00">02:00 PM - 03:00 PM</option>
              <option value="15:00">03:00 PM - 04:00 PM</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-premium hover-scale transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                <span>Confirm Visit Booking</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Booking history ledger */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-base font-poppins text-slate-800">Your Booked Visitation Logs</h3>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No visitation appointments scheduled
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-slate-800">Standard Intake Screening</h5>
                    <p className="text-xs text-slate-400 font-medium">
                      Date: {new Date(app.appointment_date).toLocaleDateString()} @ Slot: {app.appointment_time}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-150 text-green-700 uppercase tracking-wider text-[10px]">
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorAppointments;
