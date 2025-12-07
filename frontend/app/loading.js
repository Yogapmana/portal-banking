import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="relative">
          {/* Animated spinner */}
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          {/* Pulsing circle background */}
          <div className="absolute inset-0 w-16 h-16 mx-auto">
            <div className="w-full h-full bg-blue-400/20 rounded-full animate-ping"></div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
        <p className="text-sm text-gray-500">
          Please wait while we load your content
        </p>
      </div>
    </div>
  );
}
