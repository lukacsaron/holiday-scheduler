import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="space-y-6">
          {/* Icon/Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Plan your next
            <br />
            group trip
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find the perfect dates for your crew, hassle-free. No sign-ups, no fuss—just simple scheduling.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            onClick={() => navigate('/create')}
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
          >
            <span>Create Your Poll</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>

        {/* Features */}
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Lightning Fast</h3>
            <p className="text-sm text-gray-600">Create a poll in seconds</p>
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">No Sign-up</h3>
            <p className="text-sm text-gray-600">Just share a link</p>
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Group Friendly</h3>
            <p className="text-sm text-gray-600">Perfect for any size group</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
