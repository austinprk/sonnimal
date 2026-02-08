const features = [
  {
    icon: "🔄",
    title: "자동 수집",
    description: "네이버 플레이스 리뷰를 최근 30일치 자동으로 수집",
  },
  {
    icon: "📊",
    title: "불만/칭찬 TOP 3",
    description: "가장 많이 언급된 불만과 칭찬을 한눈에",
  },
  {
    icon: "💡",
    title: "개선안 3가지",
    description: "AI가 분석한 즉시 실행 가능한 행동 가이드",
  },
  {
    icon: "✍️",
    title: "악성 리뷰 답글",
    description: "정중하고 감정 섞이지 않은 답변 자동 생성",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            딱 필요한 기능만
          </h3>
          <p className="text-gray-600 text-lg">
            복잡한 분석 말고, 바로 실행할 수 있는 것만 드려요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 card-hover"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
