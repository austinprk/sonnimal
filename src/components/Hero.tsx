"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAnalyze = () => {
    setError("");

    if (!url.trim()) {
      setError("네이버 플레이스 URL을 입력해주세요.");
      return;
    }

    if (!url.includes("naver.com") && !url.includes("naver")) {
      setError(
        "올바른 네이버 플레이스 URL을 입력해주세요.\n예: https://pcmap.place.naver.com/restaurant/xxxxx"
      );
      return;
    }

    router.push(`/dashboard?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <section className="gradient-bg text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 pulse-dot"></span>
            <span className="text-sm font-medium">
              월 29,000원 · 7일 무료 체험
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            손님이 진짜 원하는 게 뭘까?
            <br />
            <span className="text-indigo-200">5분이면 알려드려요</span>
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            리뷰 읽느라 시간 쓰지 마세요.
            <br />
            AI가 분석해서 &quot;오늘 당장 뭘 바꾸면 되는지&quot; 알려드립니다
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                무료로 체험해보세요
              </h3>
              <p className="text-gray-600 mb-6">
                네이버 플레이스 URL만 입력하면 바로 분석 결과를 확인할 수 있어요
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAnalyze();
                  }}
                  placeholder="https://pcmap.place.naver.com/restaurant/xxxxx"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-900 focus:border-indigo-600 focus:outline-none text-lg"
                />
                {error && (
                  <p className="text-red-500 text-sm text-left whitespace-pre-line">
                    {error}
                  </p>
                )}
                <button
                  onClick={handleAnalyze}
                  className="w-full gradient-bg text-white px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition shadow-lg"
                >
                  무료로 분석하기 →
                </button>
              </div>

              <div className="mt-6 text-left bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  네이버 플레이스 URL 찾는 방법:
                </p>
                <ol className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>1. 네이버에서 우리 가게 검색</li>
                  <li>2. 플레이스 페이지 접속</li>
                  <li>3. 주소창의 URL 복사</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
