import Link from "next/link";
import { Users, TrendingUp, Shield, BarChart3, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
              <span className="text-xl font-semibold text-gray-900">
                Banking Portal
              </span>
            </div>
            <Link
              href="/auth/login"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Customer Management
            <br />
            for Sales Teams
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Complete platform for managing customer relationships, tracking
            sales performance, and growing your business.
          </p>

          {/* Button */}
          <div className="flex justify-center">
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Get started</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Customer Management
            </h3>
            <p className="text-gray-600">
              Organize and track all your customer data in one place
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sales Analytics
            </h3>
            <p className="text-gray-600">
              Track performance and identify growth opportunities
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure & Reliable
            </h3>
            <p className="text-gray-600">
              Enterprise-grade security to protect your data
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage customers
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed for modern sales teams
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Key Features
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Customer database management
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Sales performance tracking
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Real-time analytics dashboard
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">Secure data storage</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Team collaboration tools
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Benefits
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      Increase sales productivity by 40%
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      Improve customer retention rates
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      Streamline workflow processes
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      Better data-driven decisions
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of sales teams using our platform
          </p>
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Get started now</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 Banking Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
