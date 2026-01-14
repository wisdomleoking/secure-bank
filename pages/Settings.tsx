
import React from 'react';
import { UserData } from '../types';

const Settings: React.FC<{ user: UserData }> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <h1 className="text-4xl font-black text-gray-900 mb-2">Neural Identity</h1>
      <p className="text-gray-600 mb-12 font-medium">Manage your biometric nodes and security protocols</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 space-y-1">
            <SettingNav label="Profile Nodes" icon="fa-user-circle" active />
            <SettingNav label="Security Core" icon="fa-lock" />
            <SettingNav label="Neural Alerts" icon="fa-bell" />
            <SettingNav label="Data Privacy" icon="fa-shield-halved" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10">
            <h2 className="text-2xl font-black mb-10">Operator Node</h2>
            <div className="flex items-center space-x-8 mb-12">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                {user.profilePic}
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">{user.name}</p>
                <p className="text-gray-500 font-medium">{user.email}</p>
                <button className="text-blue-600 font-black text-sm uppercase tracking-widest mt-2">Replace Node Avatar</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <InputGroup label="First Designation" value={user.name.split(' ')[0]} />
              <InputGroup label="Last Designation" value={user.name.split(' ')[1]} />
            </div>
            <InputGroup label="Neural Interface Address" value={user.email} />
            
            <button className="w-full mt-10 bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-black transition-all">Save Neural Map</button>
          </section>

          <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10">
            <h2 className="text-2xl font-black mb-8">Security Protocols</h2>
            <div className="space-y-6">
              <ToggleRow title="Biometric Neural-Link" desc="Require Face ID / Fingerprint for all capital relocation" active />
              <ToggleRow title="AI Fraud Shielding" desc="Enable deep-learning neural monitoring for all nodes" active />
              <ToggleRow title="Two-Factor Mesh" desc="Multi-layered validation for critical interactions" active />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingNav: React.FC<{ label: string, icon: string, active?: boolean }> = ({ label, icon, active }) => (
  <button className={`w-full text-left px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center transition-all ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
    <i className={`fas ${icon} mr-4 text-lg w-6`}></i>{label}
  </button>
);

const InputGroup: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{label}</label>
    <input type="text" defaultValue={value} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none" />
  </div>
);

const ToggleRow: React.FC<{ title: string, desc: string, active?: boolean }> = ({ title, desc, active }) => (
  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-gray-200 transition-all">
    <div className="max-w-xs">
      <p className="font-black text-gray-900 leading-none mb-2">{title}</p>
      <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
    <div className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${active ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <div className={`bg-white w-6 h-6 rounded-full shadow-lg transition-transform ${active ? 'translate-x-6' : ''}`}></div>
    </div>
  </div>
);

export default Settings;
