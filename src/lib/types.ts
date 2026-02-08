export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  body: string;
  date: string;
  visitCount?: number;
}

export interface CategoryScore {
  name: string;
  score: number;
  percentage: number;
  color: string;
  textColor: string;
  warning?: string;
}

export interface RankedItem {
  rank: number;
  text: string;
  count: number;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface ActionItem {
  number: number;
  title: string;
  problem: string;
  suggestion: string;
}

export interface ReviewWithReply {
  author: string;
  rating: number;
  date: string;
  text: string;
  aiReply: string;
}

export interface AnalysisResult {
  restaurant: {
    name: string;
    placeId: string;
    period: string;
  };
  stats: {
    totalReviews: number;
    reviewChange: number;
    averageRating: number;
    needResponse: number;
  };
  categories: CategoryScore[];
  complaints: RankedItem[];
  praises: RankedItem[];
  actionItems: ActionItem[];
  reviews: ReviewWithReply[];
  isDemo: boolean;
}
