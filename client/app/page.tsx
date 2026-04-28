'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">CS</span>
          </div>
          <span className="text-amber-900 font-semibold text-xl">CreditSea</span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="/login" className="text-amber-800 hover:text-amber-950 font-medium transition-colors">Login</a>
          <a href="/signup" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100/80 border border-orange-300/50 rounded-full mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-amber-800 text-sm font-medium">Trusted by 1000+ Businesses</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-amber-900 mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-amber-900 via-orange-800 to-yellow-700 bg-clip-text text-transparent">
                Smart Loans,
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-800 via-amber-800 to-amber-900 bg-clip-text text-transparent">
                Smarter Business
              </span>
            </h1>
            
            <p className="text-xl text-amber-700 mb-8 max-w-3xl mx-auto animate-slide-up-delayed">
              Complete loan management platform for modern businesses. From application to closure, 
              streamline your entire lending workflow with powerful automation and insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-more-delayed">
              <a
                href="/login"
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-amber-600/30 transition-all duration-300 hover:scale-105 transform"
              >
                <span className="relative z-10">Access Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-orange-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a
                href="/signup"
                className="px-8 py-4 border-2 border-amber-500 bg-white/80 backdrop-blur-sm text-amber-900 font-semibold rounded-xl hover:bg-white hover:border-amber-600 hover:text-amber-950 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>


      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-up-delayed {
          animation: slideUp 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-slide-up-more-delayed {
          animation: slideUp 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

      `}</style>
    </div>
  );
}
