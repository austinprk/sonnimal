import Link from "next/link";

export default function CTA() {
  return (
    <section className="gradient-bg text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-4xl font-bold mb-6">리뷰 스트레스, 이제 그만</h3>
        <p className="text-xl text-indigo-100 mb-8">
          매달 쌓이는 리뷰, AI가 정리해서
          <br />
          &quot;오늘 바로 실행할 것&quot;만 알려드립니다
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition shadow-2xl"
        >
          지금 바로 무료로 시작하기 →
        </Link>
        <p className="text-indigo-200 mt-4 text-sm">
          카드 등록 없이 · 7일 체험 · 언제든 해지
        </p>
      </div>
    </section>
  );
}
