import React, { useState } from 'react';
import { Check, Zap, Users, Shield, ArrowRight } from 'lucide-react';
import { billingService } from '../api';
import toast from 'react-hot-toast';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      name: 'Free',
      id: 'free',
      price: '$0',
      description: 'Perfect for side projects and personal tasks.',
      features: ['Up to 3 projects', 'Basic task tracking', 'Community support', '1GB Storage'],
      icon: Shield,
      isPopular: false,
    },
    {
      name: 'Pro',
      id: 'pro',
      price: billingCycle === 'monthly' ? '$19' : '$190',
      description: 'Ideal for professional freelancers and small teams.',
      features: ['Unlimited projects', 'Advanced analytics', 'Priority email support', '10GB Storage', 'Custom fields'],
      icon: Zap,
      isPopular: true,
    },
    {
      name: 'Team',
      id: 'team',
      price: billingCycle === 'monthly' ? '$49' : '$490',
      description: 'Best for agencies and large organizations.',
      features: ['Everything in Pro', 'Team collaboration tools', 'SLA support', 'Unlimited storage', 'SSO & Advanced Security'],
      icon: Users,
      isPopular: false,
    },
  ];

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;

    setLoading(planId);
    try {
      const data = await billingService.createCheckoutSession(planId, billingCycle, { _skipToast: true });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const serverError = error.response?.data?.message;
      toast.error(serverError || 'Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-3 md:px-4">
      <div className="text-center mb-8 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-slate-400 text-xs md:text-lg max-w-2xl mx-auto px-4">
          Scale your project management with features designed for growth.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center mt-6 md:mt-10 space-x-3 md:space-x-4">
          <span className={`text-[10px] md:text-sm font-bold uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-10 md:w-14 h-5 md:h-7 bg-slate-800 rounded-full p-1 transition-colors relative"
          >
            <div className={`w-3 md:w-5 h-3 md:h-5 bg-blue-500 rounded-full transition-transform duration-200 shadow-lg shadow-blue-500/50 ${billingCycle === 'yearly' ? 'translate-x-[20px] md:translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className={`text-[10px] md:text-sm font-bold uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
            Yearly <span className="text-emerald-400 font-medium ml-1 block md:inline">(Save 20%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-sm md:max-w-none mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`
              relative flex flex-col p-5 md:p-8 rounded-2xl border transition-all duration-300
              ${plan.isPopular
                ? 'bg-slate-900 border-blue-500/50 shadow-2xl shadow-blue-500/10 md:scale-105 z-10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
            `}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}

            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <div className={`p-1.5 md:p-2 rounded-lg ${plan.isPopular ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                <plan.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">{plan.name}</h3>
            </div>

            <div className="mb-4 md:mb-6">
              <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
              <span className="text-slate-500 text-xs md:text-base ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            <p className="text-slate-400 mb-6 md:mb-8 text-xs md:text-sm leading-relaxed">
              {plan.description}
            </p>

            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start space-x-3 text-xs md:text-sm text-slate-300">
                  <Check size={16} className="text-emerald-500 shrink-0 md:w-[18px] md:h-[18px]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.id === 'free' || loading !== null}
              className={`
                w-full py-2.5 md:py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all text-xs md:text-base
                ${plan.id === 'free'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : plan.isPopular
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}
                ${loading === plan.id ? 'opacity-70' : ''}
              `}
            >
              {loading === plan.id ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{plan.id === 'free' ? 'Current Plan' : 'Upgrade Now'}</span>
                  {plan.id !== 'free' && <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-20 text-center p-6 md:p-8 rounded-2xl md:rounded-3xl bg-slate-900/40 border border-slate-800">
        <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2">Need a custom solution?</h4>
        <p className="text-slate-400 text-xs md:text-base mb-4 md:mb-6">Contact us for enterprise pricing.</p>
        <button className="text-blue-400 text-sm md:text-base font-medium hover:text-blue-300 transition-colors">
          Talk to Sales &rarr;
        </button>
      </div>
    </div>
  );
};

export default Pricing;
