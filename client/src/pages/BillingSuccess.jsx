import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const BillingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Refresh user data to show the new plan
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle size={48} />
      </div>
      <h1 className="text-4xl font-bold mb-4">Subscription Successful!</h1>
      <p className="text-slate-400 text-lg max-w-md mb-10">
        Thank you for upgrading. Your account has been updated and you now have access to premium features.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <span>Go to Dashboard</span>
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => navigate('/plans')}
          className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700"
        >
          View Plans
        </button>
      </div>
    </div>
  );
};

export default BillingSuccess;
