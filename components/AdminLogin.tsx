
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (key: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(key);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-medical-blue rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">D</div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
          <p className="text-gray-500">Please enter your clinic access key</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Access Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required
          />
          <button 
            type="submit"
            className="w-full bg-medical-blue text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
          >
            Access Dashboard
          </button>
        </form>
        <div className="text-center">
          <button onClick={() => window.location.reload()} className="text-sm text-gray-400 hover:text-medical-blue transition-colors">Return to public site</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
