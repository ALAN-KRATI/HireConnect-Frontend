import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ForEmployers = () => {
  const { isAuthenticated, isRecruiter } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Top Talent for Your Company
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Post jobs, manage applications, and hire the best candidates with HireConnect
            </p>
            <div className="flex justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : isRecruiter ? (
                <Link
                  to="/recruiter/dashboard"
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Register as Recruiter
                  </Link>
                  <Link
                    to="/candidate/dashboard"
                    className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Back to Candidate Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose HireConnect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📝"
              title="Easy Job Posting"
              description="Post unlimited jobs in minutes. Our intuitive interface makes it simple to create compelling job listings."
            />
            <FeatureCard
              icon="🔍"
              title="Smart Candidate Matching"
              description="Our AI-powered matching algorithm connects you with the most qualified candidates for your roles."
            />
            <FeatureCard
              icon="📊"
              title="Application Tracking"
              description="Track applications, schedule interviews, and manage your hiring pipeline all in one place."
            />
            <FeatureCard
              icon="💬"
              title="Direct Communication"
              description="Communicate directly with candidates through our built-in messaging system."
            />
            <FeatureCard
              icon="📈"
              title="Analytics Dashboard"
              description="Get insights into your job postings, application rates, and hiring metrics."
            />
            <FeatureCard
              icon="🤝"
              title="Interview Scheduling"
              description="Schedule and manage interviews seamlessly with calendar integration."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create Account"
              description="Sign up as a recruiter and complete your company profile."
            />
            <StepCard
              number="2"
              title="Post Jobs"
              description="Create detailed job listings with requirements and benefits."
            />
            <StepCard
              number="3"
              title="Review Applications"
              description="Browse applications, filter candidates, and shortlist the best."
            />
            <StepCard
              number="4"
              title="Hire Talent"
              description="Interview candidates and make offers to your ideal hires."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Free"
              price="₹0"
              period="forever"
              features={[
                "Up to 3 active job postings",
                "Basic candidate search",
                "Email notifications",
                "Basic analytics"
              ]}
              buttonText="Get Started"
              buttonLink="/register"
              highlighted={false}
            />
            <PricingCard
              title="Professional"
              price="₹2,999"
              period="per month"
              features={[
                "Unlimited job postings",
                "Advanced candidate filtering",
                "Priority support",
                "Detailed analytics",
                "Custom branding"
              ]}
              buttonText="Start Free Trial"
              buttonLink="/register"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              period="pricing"
              features={[
                "Everything in Professional",
                "Dedicated account manager",
                "API access",
                "Custom integrations",
                "SLA guarantee"
              ]}
              buttonText="Contact Sales"
              buttonLink="/register"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Hiring?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies already using HireConnect
          </p>
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

const StepCard = ({ number, title, description }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

const PricingCard = ({ title, price, period, features, buttonText, buttonLink, highlighted }) => (
  <div className={`p-6 rounded-lg ${highlighted ? 'bg-blue-600 text-white scale-105 shadow-lg' : 'bg-white border border-gray-200'}`}>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <div className="mb-4">
      <span className="text-4xl font-bold">{price}</span>
      <span className={`${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>/{period}</span>
    </div>
    <ul className="space-y-2 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <span className="mr-2">✓</span>
          <span className={highlighted ? 'text-blue-100' : 'text-gray-600'}>{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      to={buttonLink}
      className={`block text-center py-2 px-4 rounded-lg font-semibold transition-colors ${
        highlighted
          ? 'bg-white text-blue-600 hover:bg-gray-100'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {buttonText}
    </Link>
  </div>
)

export default ForEmployers