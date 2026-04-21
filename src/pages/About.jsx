import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const About = () => {
  const { isAuthenticated, isCandidate } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About HireConnect
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Connecting talented professionals with their dream jobs
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                At HireConnect, we believe that finding the right job or the perfect candidate 
                shouldn't be a struggle. Our platform leverages cutting-edge technology to 
                streamline the hiring process and create meaningful connections.
              </p>
              <p className="text-lg text-gray-600">
                We're committed to making job searching efficient, transparent, and rewarding 
                for everyone involved.
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-blue-800">Bridging the Gap</h3>
              <p className="text-blue-600 mt-2">Between talent and opportunity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="10K+" label="Active Jobs" />
            <StatCard number="50K+" label="Candidates" />
            <StatCard number="1K+" label="Companies" />
            <StatCard number="5K+" label="Placements" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <ValueCard
              icon="💡"
              title="Innovation"
              description="Constantly improving our platform with the latest technology."
            />
            <ValueCard
              icon="🤝"
              title="Integrity"
              description="Transparent and honest practices in everything we do."
            />
            <ValueCard
              icon="⚡"
              title="Efficiency"
              description="Streamlined processes that save time for employers and candidates."
            />
            <ValueCard
              icon="🌍"
              title="Inclusivity"
              description="Creating equal opportunities for everyone in the job market."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <TeamMember
              name="Alankrati Saxena"
              role="Developer"
              description="Passionate about creating innovative solutions that make a difference."
            />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-xl mb-8 opacity-90">
            Have questions? We'd love to hear from you.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:contact@hireconnect.com"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Email Us
            </a>
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Join HireConnect
              </Link>
            ) : (
              <Link
                to={isCandidate ? '/candidate/dashboard' : '/recruiter/dashboard'}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

const StatCard = ({ number, label }) => (
  <div className="p-6">
    <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
    <div className="text-gray-600">{label}</div>
  </div>
)

const ValueCard = ({ icon, title, description }) => (
  <div className="text-center p-6">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

const TeamMember = ({ name, role, description }) => (
  <div className="text-center">
    <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
      👤
    </div>
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="text-blue-600 font-medium">{role}</p>
    <p className="text-gray-600 text-sm mt-2">{description}</p>
  </div>
)

export default About