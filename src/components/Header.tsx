"use client";

import Link from "next/link";

export default function Header() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600">손님말</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              데모 보기
            </Link>
            <button className="gradient-bg text-white px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
              무료 체험 시작
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
