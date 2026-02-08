export const demoData = {
  restaurant: {
    name: "행복한 국밥",
    period: "최근 30일",
  },
  stats: {
    totalReviews: 87,
    reviewChange: 12,
    averageRating: 4.2,
    needResponse: 5,
  },
  categories: [
    { name: "음식 맛", score: 4.5, percentage: 90, color: "bg-indigo-600", textColor: "text-indigo-600" },
    { name: "가격 대비 만족도", score: 4.6, percentage: 92, color: "bg-green-600", textColor: "text-green-600" },
    { name: "서비스 속도", score: 3.2, percentage: 64, color: "bg-orange-600", textColor: "text-orange-600", warning: "개선 필요" },
    { name: "청결도", score: 3.8, percentage: 76, color: "bg-yellow-600", textColor: "text-yellow-600", warning: "주의 필요" },
    { name: "친절도", score: 4.4, percentage: 88, color: "bg-green-600", textColor: "text-green-600" },
  ],
  complaints: [
    { rank: 1, text: "음식은 좋은데 회전이 느려요", count: 17, borderColor: "border-red-500", badgeBg: "bg-red-100", badgeText: "text-red-700" },
    { rank: 2, text: "테이블이 좀 끈적해요", count: 12, borderColor: "border-orange-400", badgeBg: "bg-orange-100", badgeText: "text-orange-700" },
    { rank: 3, text: "사진보다 양이 적어요", count: 9, borderColor: "border-yellow-400", badgeBg: "bg-yellow-100", badgeText: "text-yellow-700" },
  ],
  praises: [
    { rank: 1, text: "양 많고 가성비 좋음", count: 23, borderColor: "border-green-500", badgeBg: "bg-green-100", badgeText: "text-green-700" },
    { rank: 2, text: "국물이 진하고 맛있어요", count: 19, borderColor: "border-emerald-400", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700" },
    { rank: 3, text: "사장님이 친절하세요", count: 15, borderColor: "border-teal-400", badgeBg: "bg-teal-100", badgeText: "text-teal-700" },
  ],
  actionItems: [
    {
      number: 1,
      title: "점심 시간 회전율 개선",
      problem: "주문 지연 언급 다수",
      suggestion: "점심 메뉴 2개는 미리 준비해두는 것을 추천드려요",
    },
    {
      number: 2,
      title: "위생 관련 불안 해소",
      problem: "수저/테이블 언급 반복",
      suggestion: '"매 손님마다 소독합니다" 문구 테이블에 부착해보세요',
    },
    {
      number: 3,
      title: "메뉴 사진 현실화",
      problem: "메뉴판 사진 과장 지적",
      suggestion: "실제 나가는 음식 사진으로 메뉴판 교체를 권장합니다",
    },
  ],
  reviews: [
    {
      author: "김**",
      rating: 2,
      date: "2025.01.28",
      text: "30분 넘게 기다렸는데 음식도 미지근하게 나왔어요. 테이블도 끈적거리고... 다시는 안 갈 것 같네요.",
      aiReply:
        "방문해 주셔서 감사합니다. 긴 대기 시간과 음식 온도, 테이블 청결 상태로 불편을 드려 죄송합니다. 주방 운영과 홀 관리에 더욱 신경 쓰겠습니다. 다음에 방문하시면 더 나은 모습으로 보답하겠습니다. 소중한 의견 감사드립니다.",
    },
    {
      author: "이**",
      rating: 2,
      date: "2025.01.25",
      text: "반찬이 너무 짜요. 국밥은 괜찮은데 밑반찬 관리를 좀 해주세요.",
      aiReply:
        "방문해 주셔서 감사합니다. 반찬 간이 짜게 느껴지셨군요. 반찬 간 조절에 더욱 신경 쓰고, 고객님들의 의견을 반영하여 개선하겠습니다. 다음에 방문하시면 만족하실 수 있도록 노력하겠습니다.",
    },
  ],
};
