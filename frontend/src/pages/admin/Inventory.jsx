import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Droplet, RefreshCw, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sweepResult, setSweepResult] = useState('');
  const [sweeping, setSweeping] = useState(false);

  const fetchData = async () => {
    try {
      const stockRes = await api.get('/blood-stock');
      if (stockRes.data.success) {
        setStock(stockRes.data.data);
      }

      const unitsRes = await api.get('/blood-stock/units');
      if (unitsRes.data.success) {
        setUnits(unitsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSweepExpiry = async () => {
    setSweeping(true);
    setSweepResult('');
    try {
      const res = await api.post('/blood-stock/sweep-expiry');
      if (res.data.success) {
        setSweepResult(res.data.message);
        fetchData();
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setSweeping(false);
    }
  };

  return (
    <div className="space-y-8 animate-slideup text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-poppins text-slate-800 tracking-tight flex items-center gap-2">
            <Droplet className="w-7 h-7 text-red-600" />
            Central Blood Inventory
          </h1>
          <p className="text-slate-500 font-medium">Shelf-life expiry tracking and inventory replenishment logs</p>
        </div>

        <button
          onClick={handleSweepExpiry}
          disabled={sweeping}
          className="px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-premium hover-scale transition-all flex items-center gap-2"
        >
          {sweeping ? (
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>Sweep Expired Units (Stored Proc)</span>
        </button>
      </div>

      {sweepResult && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 font-semibold text-xs rounded-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{sweepResult}</span>
        </div>
      )}

      {/* Summarized Stock Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {stock.map((item) => (
          <div key={item.blood_group} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover-scale transition-all">
            <div className="flex justify-between items-center">
              <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-xs">
                {item.blood_group}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mt-3 leading-none">{item.total_units}</h3>
            <span className={`inline-block text-[8px] font-bold mt-2 uppercase ${
              item.total_units === 0 
                ? 'text-red-500' 
                : item.total_units < item.min_required_units 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
            }`}>
              {item.total_units === 0 ? 'Out of stock' : item.total_units < item.min_required_units ? 'Low stock' : 'Optimal'}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed Units logs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base font-poppins text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            Detailed Blood Reserve Ledger
          </h3>
          <span className="text-xs font-semibold text-slate-400">{units.length} total units tracked</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading...</div>
          ) : units.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No blood units in reserve logs</div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 pr-4">Unit ID</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Collected Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {units.map((u) => {
                  const isExpired = new Date(u.expiry_date) < new Date() && u.status === 'available';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-4 text-xs font-bold text-slate-500">#BU-{1000 + u.id}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-xs">
                          {u.blood_group}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{new Date(u.collected_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{new Date(u.expiry_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          u.status === 'available' && !isExpired
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : u.status === 'used'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {isExpired ? 'Expired' : u.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
