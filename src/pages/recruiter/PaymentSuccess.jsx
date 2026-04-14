import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/recruiter/analytics';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for upgrading your subscription. Your account has been successfully updated.
        </p>
        <div className="space-y-3">
          <Link
            to="/recruiter/analytics"
            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/recruiter/invoices"
            className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            View Invoice
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">Redirecting in 5 seconds...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
