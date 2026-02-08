"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { demoData } from "@/lib/demo-data";

function StatsCards() {
  const { stats } = demoData;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm font-medium mb-2">전체 리뷰</p>
        <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}개</p>
        <p className="text-green-600 text-sm mt-2">
          ↑ {stats.reviewChange}% 지난달 대비
        </p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm font-medium mb-2">평균 별점</p>
        <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
        <p className="text-gray-400 text-sm mt-2">네이버 플레이스 기준</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm font-medium mb-2">답변 필요</p>
        <p className="text-3xl font-bold text-red-600">{stats.needResponse}개</p>
        <p className="text-red-600 text-sm mt-2">악성 리뷰 답글 미작성</p>
      </div>
    </div>
  );
}

function CategoryPerformance() {
  const { categories } = demoData;
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
      <h4 className="text-lg font-bold text-gray-900 mb-6">카테고리별 평가</h4>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">{cat.name}</span>
              <span className={`${cat.textColor} font-bold`}>{cat.score}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${cat.color} h-3 rounded-full transition-all duration-1000`}
                style={{ width: `${cat.percentage}%` }}
              ></div>
            </div>
            {cat.warning && (
              <p className={`text-sm ${cat.textColor} mt-1`}>
                ⚠️ {cat.warning}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Top3Section({
  title,
  icon,
  iconBg,
  items,
}: {
  title: string;
  icon: string;
  iconBg: string;
  items: typeof demoData.complaints;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center mb-6">
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mr-3`}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.rank}
            className={`border-l-4 ${item.borderColor} pl-4 py-2`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{item.rank}위</span>
              <span
                className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${item.badgeBg} ${item.badgeText}`}
              >
                언급 {item.count}회
              </span>
            </div>
            <p className="text-gray-700">&quot;{item.text}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionItems() {
  const { actionItems } = demoData;
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 mt-8 border-2 border-indigo-200">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">💡</span>
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900">
            이번 달 바로 바꿀 것 3가지
          </h4>
          <p className="text-gray-600 text-sm">
            AI가 분석한 즉시 실행 가능한 개선안
          </p>
        </div>
      </div>
      <div className="space-y-6">
        {actionItems.map((item) => (
          <div key={item.number} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                {item.number}
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-900 mb-2">{item.title}</h5>
                <p className="text-gray-600 mb-3 text-sm">
                  <span className="font-semibold text-red-600">문제:</span>{" "}
                  {item.problem}
                </p>
                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                  <p className="text-indigo-900 font-medium">
                    → {item.suggestion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewResponses() {
  const { reviews } = demoData;
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [visibleReplies, setVisibleReplies] = useState<Set<number>>(
    new Set([0])
  );

  const toggleReply = (idx: number) => {
    setVisibleReplies((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8">
      <h4 className="text-lg font-bold text-gray-900 mb-4">답변 필요한 리뷰</h4>
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <div key={idx}>
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-semibold text-gray-900">
                    {review.author}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    {"⭐".repeat(review.rating)}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">{review.date}</span>
              </div>
              <p className="text-gray-700 mb-4">&quot;{review.text}&quot;</p>
              <button
                onClick={() => toggleReply(idx)}
                className="w-full gradient-bg text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                {visibleReplies.has(idx)
                  ? "AI 답글 숨기기"
                  : "AI 답글 생성하기"}
              </button>
            </div>

            {visibleReplies.has(idx) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-5 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-200 text-green-800">
                    AI 생성 답글
                  </span>
                  <button
                    onClick={() => handleCopy(review.aiReply, idx)}
                    className="text-indigo-600 text-sm font-semibold hover:text-indigo-700"
                  >
                    {copiedIdx === idx ? "복사됨!" : "복사"}
                  </button>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  &quot;{review.aiReply}&quot;
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-xl font-semibold text-gray-900">
              리뷰 분석 중...
            </p>
            <p className="text-gray-600 mt-2">
              최근 30일 리뷰를 수집하고 있어요
            </p>
            {url && (
              <p className="text-gray-400 text-sm mt-4 max-w-md mx-auto truncate">
                {decodeURIComponent(url)}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  맛집 &apos;{demoData.restaurant.name}&apos;
                </h3>
                <p className="text-gray-500 mt-1">
                  {demoData.restaurant.period} 리뷰 분석 결과
                </p>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                분석 완료
              </div>
            </div>
          </div>

          <div className="p-8">
            <StatsCards />
            <CategoryPerformance />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Top3Section
                title="불만 TOP 3"
                icon="⚠️"
                iconBg="bg-red-100"
                items={demoData.complaints}
              />
              <Top3Section
                title="칭찬 TOP 3"
                icon="✨"
                iconBg="bg-green-100"
                items={demoData.praises}
              />
            </div>

            <ActionItems />
            <ReviewResponses />
          </div>
        </div>

        {/* Demo notice */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <p className="text-indigo-800 font-medium">
            현재 데모 데이터를 표시하고 있습니다
          </p>
          <p className="text-indigo-600 text-sm mt-1">
            실제 서비스에서는 입력한 URL의 리뷰를 크롤링하여 분석합니다
          </p>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <section className="py-20 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-xl font-semibold text-gray-900">로딩 중...</p>
            </div>
          </section>
        }
      >
        <DashboardContent />
      </Suspense>
      <Footer />
    </>
  );
}
