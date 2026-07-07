import React, { useState } from 'react';
import { FaBolt } from 'react-icons/fa';

export default function Subscription() {
  const [activePlan, setActivePlan] = useState(1); // Middle card is active (Popular)

  const subscriptionPlans = [
    {
      id: 1,
      name: 'Basic',
      description: 'Best for small firm',
      price: '$ 19.99',
      period: '/month',
      iconColor: 'text-blue-500',
      buttonText: 'Subscribed',
      buttonStyle: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      isSubscribed: true,
      isPopular: false,
    },
    {
      id: 2,
      name: 'Basic',
      description: 'Best for small firm',
      price: '$ 19.99',
      period: '/month',
      iconColor: 'text-green-500',
      buttonText: 'Get Started',
      buttonStyle: 'bg-[#5069E5] text-white hover:bg-[#3d52c7]',
      isSubscribed: false,
      isPopular: true,
    },
    {
      id: 3,
      name: 'Basic',
      description: 'Best for small firm',
      price: '$ 19.99',
      period: '/month',
      iconColor: 'text-red-500',
      buttonText: 'Get Started',
      buttonStyle: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      isSubscribed: false,
      isPopular: false,
    },
  ];

  const features = [
    'Hours Management',
    'Scheduler',
    'Template management',
    'Approval',
    'Data Visualization',
  ];

  const handlePlanClick = (planId) => {
    setActivePlan(planId);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-6">Subscription Plans</h2>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-sm p-6 relative flex flex-col ${
              plan.isPopular ? 'md:min-h-[600px]' : 'md:min-h-[500px]'
            }`}
          >
            {/* Popular Tag */}
            {plan.isPopular && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                Popular
              </div>
            )}

            {/* Lightning Icon */}
            <div className={`${plan.iconColor} mb-4`}>
              <FaBolt size={32} />
            </div>

            {/* Plan Name */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>

            {/* Button */}
            <button
              onClick={() => handlePlanClick(plan.id)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-6 ${plan.buttonStyle}`}
            >
              {plan.buttonText}
            </button>

            {/* Features */}
            <div className="mt-auto">
              <h4 className="font-bold text-gray-900 mb-3">Feature</h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2">
        {subscriptionPlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setActivePlan(plan.id)}
            className={`w-2 h-2 rounded-full transition-colors ${
              activePlan === plan.id ? 'bg-[#5069E5]' : 'bg-gray-300'
            }`}
            aria-label={`Go to plan ${plan.id}`}
          />
        ))}
      </div>
    </div>
  );
}

