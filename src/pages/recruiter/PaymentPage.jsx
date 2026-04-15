import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_CONFIG } from '../../config/api.config';
import { SUBSCRIPTION_PLANS, getPlanByName } from '../../config/subscription.config';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm = ({ selectedPlan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plan = getPlanByName(selectedPlan);
  const planPrice = plan.price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const recruiterId = localStorage.getItem('userId');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/payment/intent?recruiterId=${recruiterId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          plan: selectedPlan,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        })
      });

      if (!response.ok) throw new Error('Failed to create payment intent');
      
      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: localStorage.getItem('userName') || 'Recruiter'
          }
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (selectedPlan === 'FREE') {
    return (
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800 mb-2">Free Plan</h3>
        <p className="text-green-700 mb-4">You have selected the Free plan. No payment required.</p>
        <button
          onClick={() => onSuccess({ status: 'succeeded' })}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Activate Free Plan
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Selected Plan:</span>
          <span className="font-semibold text-lg">{selectedPlan}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-700">Amount:</span>
          <span className="font-bold text-2xl text-blue-600">{plan.priceFormatted}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4'
                  }
                },
                invalid: {
                  color: '#9e2146'
                }
              }
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : `Pay ${plan.priceFormatted}`}
        </button>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const [step, setStep] = useState('select');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    // Convert SUBSCRIPTION_PLANS object to array for rendering
    const plansArray = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      name: plan.name,
      price: plan.price,
      priceFormatted: plan.priceFormatted,
      features: plan.features
    }));
    setPlans(plansArray);
    setLoadingPlans(false);
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handleSuccess = async (paymentIntent) => {
    setStep('success');
    setTimeout(() => {
      window.location.href = '/recruiter/subscription';
    }, 3000);
  };

  const handleCancel = () => {
    setStep('select');
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upgrade Your Subscription
          </h1>
          <p className="text-gray-600">
            Choose the plan that best fits your hiring needs
          </p>
        </div>

        {step === 'select' && (
          <div className="grid md:grid-cols-3 gap-8">
            {loadingPlans ? (
              <div className="col-span-3 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all cursor-pointer hover:shadow-xl ${
                    selectedPlan?.name === plan.name ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-6">
                      <span className="text-4xl font-bold text-blue-600">{plan.priceFormatted}</span>
                      <span className="text-gray-500 ml-2">/month</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Select {plan.name}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                selectedPlan={selectedPlan}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          </div>
        )}

        {step === 'success' && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your subscription has been upgraded successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
