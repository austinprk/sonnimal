import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "손님말 - 이번 달 장사 개선 포인트",
  description: "AI가 네이버 플레이스 리뷰를 분석해서 이번 달 바로 바꿀 것 3가지를 알려드립니다",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
