import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { CheckCircle2, XCircle, Heart, ShieldAlert, Sparkles, Clock, Calendar } from 'lucide-react';

const DonorEligibility = () => {
  const { user } = useAuth();
  
  // Custom calculator states
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [lastDonation, setLastDonation] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user && user.role === 'donor') {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/donors/eligibility');
      if (res.data && res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch eligibility history:', err);
    }
  };

  if (!user || !user.details) return null;

  const calculateEligibility = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let eligible = true;
    const reasons = [];

    if (age < 18 || age > 65) {
      eligible = false;
      reasons.push('Age must be between 18 and 65 years.');
    }

    if (weight < 50) {
      eligible = false;
      reasons.push('Weight must be a minimum of 50 kg for standard blood volume recovery.');
    }

    if (lastDonation) {
      const diffTime = Math.abs(new Date() - new Date(lastDonation));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 56) {
        eligible = false;
        reasons.push(`A 56-day safety interval is required. Only ${diffDays} days have passed since your last donation.`);
      }
    }

    const reasonText = reasons.join(', ');

    try {
      const res = await api.post('/donors/eligibility', {
        weight: parseFloat(weight),
        age: parseInt(age),
        isEligible: eligible,
        reason: reasonText || 'Vitals correspond with Red Cross guidelines.'
      });
      if (res.data && res.data.success) {
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to log eligibility check:', err);
    }

    setCalcResult({ eligible, reasons });
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-slideup text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic calculator */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-poppins text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600 animate-bounce" />
              Eligibility Assessment
            </h2>
            <p className="text-xs text-slate-400">Evaluate vital health boundaries instantly</p>
          </div>

          <form onSubmit={calculateEligibility} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Your Age (Years)</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Your Weight (kg)</label>
              <input
                type="number"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Last Donation Intake (Optional)</label>
              <input
                type="date"
                value={lastDonation}
                onChange={(e) => setLastDonation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-red-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover-scale transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <span>Analyze & Save Vitals</span>
              )}
            </button>
          </form>
        </div>

        {/* Result Display & Official Rules */}
        <div className="lg:col-span-2 space-y-6">
          {calcResult && (
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              calcResult.eligible 
                ? 'bg-green-50/50 border-green-200 text-green-800' 
                : 'bg-red-50/50 border-red-200 text-red-800'
            }`}>
              <h3 className="font-extrabold font-poppins text-lg flex items-center gap-2">
                {calcResult.eligible ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    Assessment Passed!
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    Assessment Failed
                  </>
                )}
              </h3>
              
              {calcResult.eligible ? (
                <p className="text-xs font-medium">
                  Excellent! Your current vitals correspond with FDA and Red Cross safety guidelines. You are highly encouraged to proceed with scheduling a donation visitation slot.
                </p>
              ) : (
                <ul className="list-disc pl-5 text-xs font-semibold space-y-2">
                  {calcResult.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Official Rules card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-base font-poppins text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Intake Safety Guideline Criteria
            </h3>

            <div className="divide-y divide-slate-100 text-xs font-medium text-slate-600 space-y-4">
              <div className="pt-0 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                <div>
                  <h5 className="font-bold text-slate-800">Minimum Interval Intervals</h5>
                  <p className="text-slate-400 mt-0.5">A standard donor cooldown of 56 days must pass between separate whole blood donations to support natural red cell replenishment.</p>
                </div>
              </div>

              <div className="pt-4 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                <div>
                  <h5 className="font-bold text-slate-800">Minimum Weight & Age Vitals</h5>
                  <p className="text-slate-400 mt-0.5">Donors must be at least 18 years of age and weigh over 50 kilograms (110 lbs) to support standard intake volume parameters.</p>
                </div>
              </div>

              <div className="pt-4 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
                <div>
                  <h5 className="font-bold text-slate-800">Hemoglobin density</h5>
                  <p className="text-slate-400 mt-0.5">Hemoglobin counts are screened during visitation. A density of over 12.5 g/dL for females and 13.0 g/dL for males is required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Eligibility Checks Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-bold text-base font-poppins text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          My Assessment History (Saved in Cloud Database)
        </h3>

        {history.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No past eligibility records found. Take your first check above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                  <th className="p-4">Date Checked</th>
                  <th className="p-4">Age / Weight</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Details / Action Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-800 font-bold">
                      {new Date(h.check_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {h.age} yrs / {h.weight_kg} kg
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        h.is_eligible === 1 
                          ? 'bg-green-50 text-green-700 border border-green-150' 
                          : 'bg-red-50 text-red-700 border border-red-150'
                      }`}>
                        {h.is_eligible === 1 ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate" title={h.reason}>
                      {h.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorEligibility;
