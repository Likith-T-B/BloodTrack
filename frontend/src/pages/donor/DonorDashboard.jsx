import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Heart, Calendar, CheckCircle, Clock, Droplet, Sparkles } from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const histRes = await api.get('/donors/history');
        if (histRes.data.success) {
          setHistory(histRes.data.data);
        }

        const appRes = await api.get('/donors/appointments');
        if (appRes.data.success) {
          setAppointments(appRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching donor dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || !user.details) return null;

  const donorDetails = user.details;
  const nextDate = donorDetails.next_eligible_date;
  const isEligible = donorDetails.is_eligible === 1 || !nextDate || new Date(nextDate) <= new Date();

  return (
    <div className="space-y-8 animate-slideup text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-poppins text-slate-800 tracking-tight flex items-center gap-2">
          <Heart className="w-7 h-7 text-red-600 animate-pulse" />
          Donor Portal Dashboard
        </h1>
        <p className="text-slate-500 font-medium">Thank you for protecting lives. Track your donations and appointments.</p>
      </div>

      {/* Hero Eligibility Card */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
        isEligible 
          ? 'bg-green-50/60 border-green-200 text-green-800' 
          : 'bg-red-50/60 border-red-200 text-red-800'
      }`}>
        <div className="space-y-2 flex-1">
          <h3 className="font-extrabold font-poppins text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            Donation Status: {isEligible ? 'You are fully eligible to donate!' : 'You are currently on cooldown.'}
          </h3>
          <p className="text-xs font-medium opacity-90 max-w-2xl">
            {isEligible 
              ? 'Your donation metrics (age, weight, intervals) comply with the safety threshold criteria. Schedule an appointment to save lives!' 
              : `A minimum safety cooldown period of 56 days is required between donations. You will be eligible to donate again after ${new Date(nextDate).toLocaleDateString()}.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500 bg-white border border-slate-200/80 px-4 py-2 rounded-xl">
            Blood Type: <span className="text-red-600 font-black">{donorDetails.blood_group}</span>
          </span>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donations Completed</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{history.length} Intakes</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Donation Date</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">
            {donorDetails.last_donation_date ? new Date(donorDetails.last_donation_date).toLocaleDateString() : 'Never'}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Appointments</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mt-4 leading-none">{appointments.length} Booked</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Donation History logs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-base font-poppins text-slate-800">Your Donation History Logs</h3>
          
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No past donations recorded yet. Make your first donation today!
              </div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-800">1 Unit Intake ({donorDetails.blood_group})</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(h.donation_date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">HB: {h.hemoglobin} g/dL</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Scheduled appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-base font-poppins text-slate-800">Upcoming Appointments</h3>
          
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No upcoming scheduled appointments
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-800">Intake Screening Visit</h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(app.appointment_date).toLocaleDateString()} @ {app.appointment_time}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">
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

export default DonorDashboard;
