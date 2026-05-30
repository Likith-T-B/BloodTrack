import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, User, Mail, Lock, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'donor';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Role specific forms
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState(70);
  const [medicalConditions, setMedicalConditions] = useState('');

  const [licenseNumber, setLicenseNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [hospitalType, setHospitalType] = useState('private');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const details = role === 'donor' 
      ? { blood_group: bloodGroup, dob, gender, weight: parseFloat(weight), medical_conditions: medicalConditions }
      : { license_number: licenseNumber, emergency_contact: emergencyContact, hospital_type: hospitalType };

    const result = await register({
      name,
      email,
      password,
      role,
      phone,
      city,
      address,
      details
    });
    setLoading(false);

    if (result.success) {
      if (role === 'donor') {
        navigate('/donor');
      } else if (role === 'hospital') {
        navigate('/hospital');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Registration failed. Verify fields.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-6 lg:px-8 font-inter">
      <div className="max-w-xl w-full space-y-8 glass-panel p-10 rounded-3xl shadow-premium border border-white animate-slideup">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-lg glow-red mb-4">
            <Droplet className="w-6 h-6 text-white" />
          </Link>
          <h2 className="text-3xl font-extrabold font-poppins text-slate-900 tracking-tight">Register Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Join the BloodTrack network
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Profile */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-150 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 font-poppins">1. General Account Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Full Name / Hospital Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mail.com"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chicago"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Address Location</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 522 Grand Ave"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 block mb-2">Select User Role</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('donor')}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'donor' 
                      ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  🩸 Register as Donor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('hospital')}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                    role === 'hospital' 
                      ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  🏥 Register as Hospital
                </button>
              </div>
            </div>
          </div>

          {/* Role specific inputs */}
          {role === 'donor' ? (
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-150 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 font-poppins">2. Donor Specific Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Medical Conditions / Details</label>
                <textarea
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. None. Excellent general health."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm h-20"
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-150 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 font-poppins">2. Hospital Specific Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Medical License Number</label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. LIC-IL-89988"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Emergency Operations Hotline</label>
                  <input
                    type="text"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. +1 312-555-0911"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Hospital Operation Type</label>
                  <select
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                  >
                    <option value="private">Private Clinic / Hospital</option>
                    <option value="government">Government Medical Center</option>
                    <option value="clinic">Community Clinic</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-premium hover-scale transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-red-600 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
