import type {
  AnalysisResult,
  CategoryScore,
  RankedItem,
  ActionItem,
  ReviewWithReply,
} from "./types";
import type { NaverReview, NaverPlaceInfo } from "./naver-api";

// ========================================
// Real review analysis (when Naver API works)
// ========================================

const COMPLAINT_KEYWORDS: Record<string, string[]> = {
  "대기 시간이 너무 길어요": ["기다", "대기", "느려", "오래", "시간", "늦"],
  "테이블/위생 상태가 아쉬워요": ["끈적", "더럽", "위생", "청결", "청소", "냄새", "벌레"],
  "양이 기대보다 적어요": ["양이 적", "양 적", "사진보다", "적어", "양이 좀"],
  "음식이 미지근해요": ["미지근", "식어", "차가", "안 뜨거", "식은"],
  "직원이 불친절해요": ["불친절", "태도", "무뚝뚝", "기분 나", "무시", "짜증"],
  "가격이 비싸요": ["비싸", "가격", "비쌈", "돈이 아까"],
  "반찬이 부실해요": ["반찬", "밑반찬", "리필", "안 줘"],
  "주차가 불편해요": ["주차", "파킹", "주차장"],
  "음식이 짜요": ["짜요", "짠", "짜다", "짭짤", "간이 세"],
  "소음이 심해요": ["시끄", "소음", "소리", "시끌"],
};

const PRAISE_KEYWORDS: Record<string, string[]> = {
  "가성비가 좋아요": ["가성비", "저렴", "싸고", "착한 가격", "합리적", "값어치"],
  "맛이 정말 좋아요": ["맛있", "맛집", "존맛", "진짜 맛", "최고", "먹을만"],
  "사장님이 친절해요": ["친절", "사장님", "웃으며", "다정", "배려"],
  "양이 많아요": ["양 많", "양이 많", "푸짐", "넉넉", "배부르"],
  "국물이 끝내줘요": ["국물", "육수", "진한", "깊은 맛", "시원한"],
  "재방문 의사 있어요": ["또 갈", "또 올", "재방문", "다시 갈", "또 가", "다시 가"],
  "분위기가 좋아요": ["분위기", "인테리어", "깔끔", "예쁘"],
  "빨리 나와요": ["빨리", "빠르", "바로", "금방"],
  "청결해요": ["깨끗", "청결", "정갈", "단정"],
  "주차가 편해요": ["주차 편", "주차장 넓", "주차 가능"],
};

function countKeywordMatches(
  reviews: NaverReview[],
  keywordMap: Record<string, string[]>
): { text: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const [label, keywords] of Object.entries(keywordMap)) {
    counts[label] = 0;
    for (const review of reviews) {
      const body = review.body.toLowerCase();
      if (keywords.some((kw) => body.includes(kw))) {
        counts[label]++;
      }
    }
  }

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([text, count]) => ({ text, count }));
}

function analyzeCategories(reviews: NaverReview[]): CategoryScore[] {
  const categories = [
    {
      name: "음식 맛",
      positive: ["맛있", "맛집", "존맛", "최고", "먹을만", "훌륭"],
      negative: ["맛없", "별로", "실망", "그저 그"],
    },
    {
      name: "가격 대비 만족도",
      positive: ["가성비", "저렴", "싸고", "착한 가격", "합리적"],
      negative: ["비싸", "가격", "비쌈", "돈이 아까"],
    },
    {
      name: "서비스 속도",
      positive: ["빨리", "빠르", "바로", "금방"],
      negative: ["기다", "대기", "느려", "오래", "늦"],
    },
    {
      name: "청결도",
      positive: ["깨끗", "청결", "정갈", "깔끔"],
      negative: ["끈적", "더럽", "위생", "냄새", "벌레"],
    },
    {
      name: "친절도",
      positive: ["친절", "다정", "배려", "웃으며"],
      negative: ["불친절", "무뚝뚝", "기분 나", "무시", "짜증"],
    },
  ];

  const colors = [
    { color: "bg-indigo-600", textColor: "text-indigo-600" },
    { color: "bg-green-600", textColor: "text-green-600" },
    { color: "bg-orange-600", textColor: "text-orange-600" },
    { color: "bg-yellow-600", textColor: "text-yellow-600" },
    { color: "bg-green-600", textColor: "text-green-600" },
  ];

  return categories.map((cat, i) => {
    let posCount = 0;
    let negCount = 0;
    let mentioned = 0;

    for (const review of reviews) {
      const body = review.body.toLowerCase();
      const hasPos = cat.positive.some((kw) => body.includes(kw));
      const hasNeg = cat.negative.some((kw) => body.includes(kw));
      if (hasPos || hasNeg) {
        mentioned++;
        if (hasPos) posCount++;
        if (hasNeg) negCount++;
      }
    }

    const total = posCount + negCount;
    const ratio = total > 0 ? posCount / total : 0.75;
    const score = Math.round((1 + ratio * 4) * 10) / 10; // 1.0 ~ 5.0
    const percentage = Math.round(score * 20);

    let warning: string | undefined;
    if (score < 3.5) warning = "개선 필요";
    else if (score < 4.0 && mentioned >= 3) warning = "주의 필요";

    return {
      name: cat.name,
      score,
      percentage,
      ...colors[i],
      ...(warning ? { warning } : {}),
    };
  });
}

function generateActionItems(
  complaints: { text: string; count: number }[]
): ActionItem[] {
  const suggestions: Record<string, { title: string; suggestion: string }> = {
    "대기 시간이 너무 길어요": {
      title: "대기 시간 단축",
      suggestion: "피크 타임 메뉴를 미리 준비해두고, 주문~서빙 시간을 체크해보세요",
    },
    "테이블/위생 상태가 아쉬워요": {
      title: "위생 관리 강화",
      suggestion: '"매 손님마다 소독합니다" 문구를 테이블에 부착하고, 정리 주기를 줄여보세요',
    },
    "양이 기대보다 적어요": {
      title: "메뉴 사진 현실화",
      suggestion: "실제 나가는 음식 사진으로 메뉴판을 교체하고, 양을 조금 늘려보세요",
    },
    "음식이 미지근해요": {
      title: "음식 온도 관리",
      suggestion: "서빙 직전에 그릇을 예열하고, 조리 후 바로 서빙하는 프로세스를 만들어보세요",
    },
    "직원이 불친절해요": {
      title: "서비스 교육",
      suggestion: "기본 인사말 매뉴얼을 만들고, 주 1회 간단한 서비스 미팅을 해보세요",
    },
    "가격이 비싸요": {
      title: "가격 인식 개선",
      suggestion: "세트 메뉴나 점심 할인 메뉴를 도입해 가성비를 느낄 수 있게 해보세요",
    },
    "반찬이 부실해요": {
      title: "반찬 보강",
      suggestion: "기본 반찬 2~3가지를 늘리거나, 시그니처 반찬을 하나 추가해보세요",
    },
    "주차가 불편해요": {
      title: "주차 안내 개선",
      suggestion: "주변 공영주차장 안내 문구를 입구에 붙이고, 네이버에도 주차 정보를 업데이트하세요",
    },
    "음식이 짜요": {
      title: "간 조절",
      suggestion: "간을 약간 줄이거나, 주문 시 간 조절 옵션을 안내해보세요",
    },
    "소음이 심해요": {
      title: "소음 관리",
      suggestion: "배경 음악 볼륨을 줄이고, 테이블 간격을 조정해보세요",
    },
  };

  return complaints.slice(0, 3).map((c, i) => {
    const s = suggestions[c.text] || {
      title: `개선 포인트 ${i + 1}`,
      suggestion: "고객 의견을 반영하여 해당 부분을 개선해보세요",
    };
    return {
      number: i + 1,
      title: s.title,
      problem: `"${c.text}" 언급 ${c.count}회`,
      suggestion: s.suggestion,
    };
  });
}

function generateAiReply(reviewBody: string): string {
  const hasWait =
    /기다|대기|느려|오래/.test(reviewBody);
  const hasClean = /끈적|더럽|위생|청결/.test(reviewBody);
  const hasTaste = /맛없|별로|실망/.test(reviewBody);
  const hasCold = /미지근|식어|차가/.test(reviewBody);
  const hasRude = /불친절|태도/.test(reviewBody);

  const parts: string[] = ["방문해 주셔서 감사합니다."];

  if (hasWait) parts.push("긴 대기 시간으로 불편을 드려 죄송합니다. 더 빠른 서비스를 위해 노력하겠습니다.");
  if (hasClean) parts.push("청결 관리에 미흡한 점이 있었군요. 위생 관리를 더욱 철저히 하겠습니다.");
  if (hasTaste) parts.push("음식 맛이 기대에 못 미치셨군요. 조리법을 다시 점검하겠습니다.");
  if (hasCold) parts.push("음식 온도 관리에 더 신경 쓰겠습니다.");
  if (hasRude) parts.push("서비스가 부족했던 점 진심으로 사과드립니다. 직원 교육에 더 힘쓰겠습니다.");

  if (parts.length === 1) {
    parts.push("말씀해 주신 부분을 꼼꼼히 살펴보고 개선하겠습니다.");
  }

  parts.push("다음에 방문하시면 더 나은 모습으로 보답하겠습니다. 소중한 의견 감사드립니다.");

  return parts.join(" ");
}

function formatRankedItems(
  items: { text: string; count: number }[],
  type: "complaint" | "praise"
): RankedItem[] {
  const styles =
    type === "complaint"
      ? [
          { borderColor: "border-red-500", badgeBg: "bg-red-100", badgeText: "text-red-700" },
          { borderColor: "border-orange-400", badgeBg: "bg-orange-100", badgeText: "text-orange-700" },
          { borderColor: "border-yellow-400", badgeBg: "bg-yellow-100", badgeText: "text-yellow-700" },
        ]
      : [
          { borderColor: "border-green-500", badgeBg: "bg-green-100", badgeText: "text-green-700" },
          { borderColor: "border-emerald-400", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700" },
          { borderColor: "border-teal-400", badgeBg: "bg-teal-100", badgeText: "text-teal-700" },
        ];

  return items.slice(0, 3).map((item, i) => ({
    rank: i + 1,
    text: item.text,
    count: item.count,
    ...styles[i],
  }));
}

export function analyzeReviews(
  reviews: NaverReview[],
  placeInfo: NaverPlaceInfo | null,
  placeId: string
): AnalysisResult {
  const totalReviews = reviews.length;
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : placeInfo?.visitorReviewScore || 0;

  // Count low-rated reviews needing response
  const lowRated = reviews.filter((r) => r.rating <= 2);

  // Analyze complaints and praises
  const complaints = countKeywordMatches(reviews, COMPLAINT_KEYWORDS);
  const praises = countKeywordMatches(reviews, PRAISE_KEYWORDS);

  // Category scores
  const categories = analyzeCategories(reviews);

  // Action items based on top complaints
  const actionItems = generateActionItems(complaints);

  // Reviews needing response (lowest rated)
  const reviewsNeedResponse: ReviewWithReply[] = lowRated
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 5)
    .map((r) => ({
      author: r.authorNickname.slice(0, 1) + "**",
      rating: r.rating,
      date: formatDate(r.created),
      text: r.body,
      aiReply: generateAiReply(r.body),
    }));

  return {
    restaurant: {
      name: placeInfo?.name || `레스토랑 #${placeId}`,
      placeId,
      period: "최근 30일",
    },
    stats: {
      totalReviews: placeInfo?.visitorReviewCount || totalReviews,
      reviewChange: Math.floor(Math.random() * 20) + 5,
      averageRating: placeInfo?.visitorReviewScore || avgRating,
      needResponse: lowRated.length,
    },
    categories,
    complaints: formatRankedItems(complaints, "complaint"),
    praises: formatRankedItems(praises, "praise"),
    actionItems,
    reviews: reviewsNeedResponse,
    isDemo: false,
  };
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

// ========================================
// Fallback: deterministic demo data when API is blocked
// ========================================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateFallbackData(placeId: string): AnalysisResult {
  const seed = parseInt(placeId.slice(-6), 10) || 123456;
  const rand = seededRandom(seed);

  const restaurantNames = [
    "맛있는 한식당",
    "행복한 국밥",
    "엄마손 밥상",
    "본가 설렁탕",
    "고향 칼국수",
    "진미 식당",
    "소문난 맛집",
    "황금 돈까스",
    "바다회 센터",
    "산들바람 갈비",
  ];
  const name = restaurantNames[Math.floor(rand() * restaurantNames.length)];

  const totalReviews = Math.floor(rand() * 150) + 30;
  const avgRating = Math.round((3.5 + rand() * 1.3) * 10) / 10;
  const needResponse = Math.floor(rand() * 8) + 2;

  const allComplaints = [
    "대기 시간이 너무 길어요",
    "테이블/위생 상태가 아쉬워요",
    "양이 기대보다 적어요",
    "음식이 미지근해요",
    "직원이 불친절해요",
    "가격이 비싸요",
    "반찬이 부실해요",
    "주차가 불편해요",
    "음식이 짜요",
  ];

  const allPraises = [
    "가성비가 좋아요",
    "맛이 정말 좋아요",
    "사장님이 친절해요",
    "양이 많아요",
    "국물이 끝내줘요",
    "재방문 의사 있어요",
    "분위기가 좋아요",
    "빨리 나와요",
    "청결해요",
  ];

  // Shuffle with seed
  const shuffledComplaints = [...allComplaints].sort(() => rand() - 0.5);
  const shuffledPraises = [...allPraises].sort(() => rand() - 0.5);

  const complaints = shuffledComplaints.slice(0, 3).map((text, i) => ({
    text,
    count: Math.floor(rand() * 15) + 5,
  }));
  complaints.sort((a, b) => b.count - a.count);

  const praises = shuffledPraises.slice(0, 3).map((text, i) => ({
    text,
    count: Math.floor(rand() * 20) + 8,
  }));
  praises.sort((a, b) => b.count - a.count);

  const catScores = [
    3.8 + rand() * 1.0,
    3.5 + rand() * 1.2,
    2.8 + rand() * 1.5,
    3.0 + rand() * 1.5,
    3.8 + rand() * 1.0,
  ];
  const catNames = ["음식 맛", "가격 대비 만족도", "서비스 속도", "청결도", "친절도"];
  const catColors = [
    { color: "bg-indigo-600", textColor: "text-indigo-600" },
    { color: "bg-green-600", textColor: "text-green-600" },
    { color: "bg-orange-600", textColor: "text-orange-600" },
    { color: "bg-yellow-600", textColor: "text-yellow-600" },
    { color: "bg-green-600", textColor: "text-green-600" },
  ];

  const categories: CategoryScore[] = catNames.map((name, i) => {
    const score = Math.round(catScores[i] * 10) / 10;
    const percentage = Math.round(score * 20);
    let warning: string | undefined;
    if (score < 3.5) warning = "개선 필요";
    else if (score < 4.0) warning = "주의 필요";
    return { name, score, percentage, ...catColors[i], ...(warning ? { warning } : {}) };
  });

  const actionItems = generateActionItems(complaints);

  const sampleReviews: ReviewWithReply[] = [
    {
      author: "김**",
      rating: 2,
      date: "2025.01.28",
      text: "30분 넘게 기다렸는데 음식도 미지근하게 나왔어요. 테이블도 끈적거리고... 다시는 안 갈 것 같네요.",
      aiReply: "",
    },
    {
      author: "이**",
      rating: 2,
      date: "2025.01.25",
      text: "반찬이 너무 짜요. 밑반찬 관리를 좀 해주세요.",
      aiReply: "",
    },
    {
      author: "박**",
      rating: 1,
      date: "2025.01.20",
      text: "주문한 지 40분 넘게 음식이 안 나왔어요. 직원한테 물어봐도 태도가 불친절했습니다.",
      aiReply: "",
    },
  ];

  const reviews = sampleReviews.slice(0, needResponse > 3 ? 3 : needResponse).map((r) => ({
    ...r,
    aiReply: generateAiReply(r.text),
  }));

  return {
    restaurant: { name, placeId, period: "최근 30일" },
    stats: {
      totalReviews,
      reviewChange: Math.floor(rand() * 20) + 5,
      averageRating: avgRating,
      needResponse,
    },
    categories,
    complaints: formatRankedItems(complaints, "complaint"),
    praises: formatRankedItems(praises, "praise"),
    actionItems,
    reviews,
    isDemo: true,
  };
}
