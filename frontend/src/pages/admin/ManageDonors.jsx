import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, 
  PlusCircle, 
  Droplet, 
  Calendar,
  Search,
  Activity,
  Heart,
  CheckCircle,
  FileText
} from 'lucide-react';

const ManageDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchBlood, setSearchBlood] = useState('');

  // Recording form
  const [selectedDonor, setSelectedDonor] = useState('');
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [unitsDonated, setUnitsDonated] = useState(1);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [pulseRate, setPulseRate] = useState(72);
  const [hemoglobin, setHemoglobin] = useState(14.5);
  const [notes, setNotes] = useState('');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const fetchDonors = async () => {
    try {
      const res = await api.get('/donors', {
        params: { bloodGroup: searchBlood, city: searchCity }
      });
      if (res.data.success) {
        setDonors(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching donors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [searchBlood, searchCity]);

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!selectedDonor) {
      setFormError('Please select a donor');
      return;
    }

    try {
      const res = await api.post('/donors/donate', {
        donorId: selectedDonor,
        donationDate,
        unitsDonated: parseInt(unitsDonated),
        bloodPressure,
        pulseRate: parseInt(pulseRate),
        hemoglobin: parseFloat(hemoglobin),
        notes
      });

      if (res.data.success) {
        setFormSuccess(res.data.message);
        // Clear fields
        setSelectedDonor('');
        setNotes('');
        fetchDonors();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error recording donation');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideup text-left">
      {/* List Donors & Search Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Registered Donors Directory
            </h2>
            <span className="text-xs font-semibold text-slate-400">{donors.length} registered</span>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200/60 rounded-xl">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by city..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-slate-600 font-medium"
              />
            </div>
            <select
              value={searchBlood}
              onChange={(e) => setSearchBlood(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-red-500"
            >
              <option value="">All Blood Groups...</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Table Directory */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
            ) : donors.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No matching donors registered
              </div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="py-3 pr-4">Donor Name</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Last Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {donors.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-bold text-slate-800">{d.name}</div>
                        <div className="text-[10px] text-slate-400">{d.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{d.city}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-xs">
                          {d.blood_group}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          d.is_eligible 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {d.is_eligible ? 'Eligible' : 'Cooldown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Grid Right: Record Intake form */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-24">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-600" />
              Record Blood Intake
            </h2>
            <p className="text-xs text-slate-400">Triggers auto updating inventory & cooldowns</p>
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

          <form onSubmit={handleRecordDonation} className="space-y-4">
            {/* Select Donor */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Select Donor</label>
              <select
                value={selectedDonor}
                onChange={(e) => setSelectedDonor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm font-medium"
              >
                <option value="">Choose donor profile...</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.blood_group} - {d.is_eligible ? 'Eligible' : 'Cooldown'})
                  </option>
                ))}
              </select>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Donation Date</label>
                <input
                  type="date"
                  required
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Units (Default 1)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={unitsDonated}
                  onChange={(e) => setUnitsDonated(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">BP (e.g. 120/80)</label>
                <input
                  type="text"
                  required
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Hemoglobin (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Intake Medical Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Healthy donor. No side effects reported."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 h-20"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-premium hover-scale transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span>Submit Donation Intake</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageDonors;
