import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const BillingCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
        <XCircle size={48} />
      </div>
      <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
      <p className="text-slate-400 text-lg max-w-md mb-10">
        The checkout process was cancelled. No charges were made to your account.
        If you encountered any issues, please contact our support.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/plans')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <ArrowLeft size={18} />
          <span>Back to Plans</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default BillingCancel;
