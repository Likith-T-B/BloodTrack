import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Search, 
  Droplet, 
  ShieldCheck, 
  AlertOctagon, 
  Activity, 
  Heart, 
  Building2, 
  Users, 
  PhoneCall 
} from 'lucide-react';

const Home = () => {
  const [stock, setStock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [searchBlood, setSearchBlood] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [filteredStock, setFilteredStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockRes = await api.get('/blood-stock');
        if (stockRes.data.success) {
          setStock(stockRes.data.data);
          setFilteredStock(stockRes.data.data);
        }

        const alertsRes = await api.get('/blood-stock/alerts');
        if (alertsRes.data.success) {
          setAlerts(alertsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching home stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let results = stock;
    if (searchBlood) {
      results = results.filter(s => s.blood_group === searchBlood);
    }
    setFilteredStock(results);
  };

  const totalUnits = stock.reduce((sum, item) => sum + (item.total_units || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      {/* Premium Header/Navbar */}
      <nav className="glass-panel sticky top-0 z-50 px-8 h-20 flex items-center justify-between border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-md">
            <Droplet className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 font-poppins">BloodTrack</h1>
            <span className="text-[10px] text-red-600 font-bold tracking-widest uppercase block -mt-1">Smart Blood Tracker</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-premium hover-scale transition-all">
            Join as Donor
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-24 px-8 overflow-hidden bg-gradient-to-b from-red-50/70 via-slate-50 to-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-700 bg-red-100/80 border border-red-200">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Real-time Healthcare Logistics
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-poppins leading-[1.1]">
              Every Drop Saves Lives.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 font-black">
                Managed Smartly.
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl">
              An advanced, database-optimized platform facilitating direct interaction between hospitals, registered blood donors, and real-time inventory management systems.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/register?role=hospital" className="px-6 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl hover-scale shadow-lg transition-all">
                Request Blood Setup
              </Link>
              <Link to="/register?role=donor" className="px-6 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl hover-scale border border-red-200 transition-all">
                Register as Donor
              </Link>
            </div>
          </div>

          {/* Interactive Blood Stock Dashboard preview */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 rounded-3xl shadow-premium border border-white/60 animate-slideup">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold font-poppins text-slate-800">Available Stock Overview</h3>
                <span className="text-xs font-bold text-slate-400">Live inventory</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {stock.map((s) => (
                  <div key={s.blood_group} className="bg-white p-3 rounded-xl border border-slate-100 text-center hover-scale transition-all">
                    <span className="text-xs font-bold text-slate-400 block">{s.blood_group}</span>
                    <span className="text-lg font-black text-red-600 mt-1 block">{s.total_units}</span>
                    <span className="text-[8px] font-semibold text-slate-400 tracking-tight uppercase block mt-1">units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Alerts Ticker */}
      {alerts.length > 0 && (
        <section className="bg-red-600 text-white py-4 px-8 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-800 animate-bounce">
                <AlertOctagon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight uppercase font-poppins">🚨 CRITICAL BROADCAST: MATCHING DONORS URGENTLY NEEDED</p>
                <p className="text-xs text-red-100 font-medium">
                  {alerts[0].message}
                </p>
              </div>
            </div>
            <Link to="/register?role=donor" className="px-4 py-2 text-xs font-bold text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors shadow">
              Donate Now
            </Link>
          </div>
        </section>
      )}

      {/* Search Widget */}
      <section className="py-20 px-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-poppins text-slate-800">Check Blood Group Availability</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Use our smart DBMS search index to review real-time stock levels of compatible blood types in our repositories.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 p-2 bg-slate-100 rounded-2xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-slate-400" />
              <select
                value={searchBlood}
                onChange={(e) => setSearchBlood(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-700 font-medium py-3"
              >
                <option value="">Select Blood Group...</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all">
              Query Inventory
            </button>
          </form>

          {/* Search Result display */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {filteredStock.map((item) => (
              <div key={item.blood_group} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left hover-scale transition-all">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    {item.blood_group}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    item.total_units === 0 
                      ? 'bg-red-100 text-red-700' 
                      : item.total_units < item.min_required_units 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                  }`}>
                    {item.total_units === 0 ? 'Out of stock' : item.total_units < item.min_required_units ? 'Low stock' : 'Available'}
                  </span>
                </div>
                <h4 className="text-3xl font-black text-slate-800 mt-4 leading-none">{item.total_units}</h4>
                <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">Units In Central Stock</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold font-poppins text-slate-800">Advanced Platform Capabilities</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Our DBMS features are optimized to provide safe, reliable, and instantaneous logistics processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Direct Coordination</h3>
              <p className="text-sm text-slate-500">
                Direct integration connects hospital blood demand workflows to active donors instantly, minimizing operational bottlenecks.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Expiry Tracking & Sweeping</h3>
              <p className="text-sm text-slate-500">
                Automated database tracking and procedures flag blood units close to their 42-day expiration to prevent waste.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Emergency Alert Broadcasts</h3>
              <p className="text-sm text-slate-500">
                Automated broadcast mechanisms notify matching, eligible donors when compatible groups fall below safety parameters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-20 bg-slate-900 text-white text-center px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-4xl font-extrabold font-poppins text-red-500">2,500+</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-2">Registered Donors</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold font-poppins text-red-500">{totalUnits}</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-2">Units Available Now</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold font-poppins text-red-500">120+</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-2">Partner Hospitals</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold font-poppins text-red-500">10,000+</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-2">Lives Protected</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-center px-8 border-t border-slate-900 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600" />
            <span className="text-white font-bold font-poppins">BloodTrack</span>
          </div>
          <p>© 2026 BloodTrack Management System. Built with Vite, Node & MySQL.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
