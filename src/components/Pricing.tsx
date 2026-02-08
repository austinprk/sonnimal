"use client";

import Link from "next/link";

const plans = [
  {
    name: "베이직",
    price: "29,000원",
    features: [
      "리뷰 자동 수집 (최근 30일)",
      "불만/칭찬 TOP 3",
      "개선안 3가지",
      "답글 생성 월 10회",
    ],
    isPro: false,
  },
  {
    name: "프로",
    price: "49,000원",
    features: [
      "베이직 플랜 모든 기능",
      "답글 생성 무제한",
      "주간 리포트 발송",
      "카카오톡 알림",
    ],
    isPro: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">투명한 가격</h3>
          <p className="text-gray-600 text-lg">부담 없이 시작하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.isPro
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-xl border-2 border-indigo-500 relative"
                  : "bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200"
              }
            >
              {plan.isPro && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                    추천
                  </span>
                </div>
              )}
              <h4
                className={`text-xl font-bold mb-2 ${
                  plan.isPro ? "text-white" : "text-gray-900"
                }`}
              >
                {plan.name}
              </h4>
              <div className="flex items-baseline mb-6">
                <span
                  className={`text-4xl font-bold ${
                    plan.isPro ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`ml-2 ${
                    plan.isPro ? "text-indigo-200" : "text-gray-500"
                  }`}
                >
                  /월
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span
                      className={`mr-2 ${
                        plan.isPro ? "text-green-300" : "text-green-500"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={plan.isPro ? "text-white" : "text-gray-700"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition ${
                  plan.isPro
                    ? "bg-white text-indigo-600 hover:bg-gray-50 shadow-lg font-bold"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                7일 무료 체험
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          7일 무료 체험 후 자동 결제 · 언제든 해지 가능 · 환불 보장
        </p>
      </div>
    </section>
  );
}
