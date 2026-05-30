import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Building2, Search, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        if (res.data.success) {
          setHospitals(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching hospitals:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.city && h.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-slideup text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-poppins text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-red-600" />
            Partner Hospitals
          </h1>
          <p className="text-slate-500 font-medium">Verify credentials and manage emergency contacts</p>
        </div>

        <div className="w-full sm:w-72 flex items-center gap-2 p-2 bg-white border border-slate-200/80 rounded-xl shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none text-slate-600 font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm font-semibold">
          No registered partner hospitals found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hosp) => (
            <div key={hosp.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover-scale transition-all space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 capitalize">
                  {hosp.hospital_type || 'Private'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-base font-poppins">{hosp.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {hosp.address}, {hosp.city}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 space-y-2 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">License:</span>
                  <span className="font-bold text-slate-800 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    {hosp.license_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Main Phone:</span>
                  <span>{hosp.phone}</span>
                </div>
                <div className="flex justify-between items-center bg-red-50/50 p-2 rounded-xl border border-red-100/50">
                  <span className="text-red-700 font-bold flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Hotline:
                  </span>
                  <span className="font-black text-red-700">{hosp.emergency_contact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageHospitals;
