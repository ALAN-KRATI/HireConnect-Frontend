import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/api';
import { SUBSCRIPTION_PLANS, getPlanByName } from '../../config/subscription.config';
import { useAuth } from '../../context/AuthContext';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Current subscription
      try {
        const subResponse = await subscriptionService.getCurrentPlan(user.userId);

        // No active subscription yet
        if (
          subResponse.status === 204 ||
          !subResponse.data ||
          Object.keys(subResponse.data).length === 0
        ) {
          setCurrentSubscription(null);
        } else {
          setCurrentSubscription(subResponse.data);
        }
      } catch (subError) {
        // 204 / 404 / no subscription should not break page
        if (
          subError.response?.status === 204 ||
          subError.response?.status === 404
        ) {
          setCurrentSubscription(null);
        } else {
          throw subError;
        }
      }

      // Invoices
      try {
        const invResponse = await subscriptionService.getInvoices(user.userId);

        if (invResponse.data && Array.isArray(invResponse.data)) {
          setInvoices(invResponse.data.slice(0, 5));
        } else {
          setInvoices([]);
        }
      } catch (invError) {
        console.log('No invoices found');
        setInvoices([]);
      }

    } catch (err) {
      console.error('Error fetching subscription:', err);

      // Only show banner for real server issues, not "no subscription yet"
      if (err.response?.status !== 204 && err.response?.status !== 404) {
        setError('Failed to load subscription data');
      }
    } finally {
      setLoading(false);
    }
  };  
  const getPlanConfig = (planName) => {
    const upperPlan = planName?.toUpperCase();
    if (upperPlan === 'FREE') return SUBSCRIPTION_PLANS.FREE;
    if (upperPlan === 'PROFESSIONAL' || upperPlan === 'STARTER') return SUBSCRIPTION_PLANS.PROFESSIONAL;
    if (upperPlan === 'ENTERPRISE') return SUBSCRIPTION_PLANS.ENTERPRISE;
    return SUBSCRIPTION_PLANS.FREE;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleUpgrade = (planName) => {
    navigate('/recruiter/upgrade', { state: { selectedPlan: planName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const currentPlan = currentSubscription?.plan || 'FREE';
  const planConfig = getPlanConfig(currentPlan);
  const isFree = currentPlan.toUpperCase() === 'FREE';
  const daysRemaining = getDaysRemaining(currentSubscription?.endDate);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/recruiter/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900">Subscription</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage your subscription plan and billing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Current Subscription Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Current Plan: {currentPlan}</h2>
                {currentSubscription?.status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentSubscription.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentSubscription.status}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-lg font-semibold text-gray-900">{planConfig.priceFormatted}<span className="text-sm text-gray-500 font-normal">/month</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Limit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {planConfig.jobLimit === Infinity ? 'Unlimited' : planConfig.jobLimit}
                  </p>
                </div>
                {!isFree && currentSubscription && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(currentSubscription.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Renews On</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(currentSubscription.endDate)}</p>
                    </div>
                  </>
                )}
              </div>

              {!isFree && daysRemaining > 0 && (
                <p className="text-sm text-gray-600 mt-4">
                  Your subscription will renew in <span className="font-semibold text-blue-600">{daysRemaining} days</span>
                </p>
              )}

              {isFree && (
                <p className="text-sm text-gray-600 mt-4">
                  You're on the free plan. Upgrade to unlock more features!
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {!isFree && (
                <button
                  onClick={() => navigate('/recruiter/invoices')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View Invoices
                </button>
              )}
              <Link
                to="/recruiter/upgrade"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
              >
                {isFree ? 'Upgrade Plan' : 'Change Plan'}
              </Link>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {planConfig.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
              const isCurrent = plan.name === currentPlan.toUpperCase();
              const canUpgrade = plan.name !== 'FREE' && !isCurrent;
              
              return (
                <div
                  key={plan.name}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
                    isCurrent 
                      ? 'border-blue-500 ring-2 ring-blue-100' 
                      : 'border-transparent hover:shadow-xl'
                  }`}
                >
                  {isCurrent && (
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                      Current Plan
                    </div>
                  )}
                  
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => canUpgrade && handleUpgrade(plan.name)}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          canUpgrade
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {plan.name === 'FREE' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Invoices */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
              <Link to="/recruiter/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.invoiceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Invoice #{invoice.invoiceId}</p>
                      <p className="text-sm text-gray-500">{formatDate(invoice.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">₹{invoice.amount}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;