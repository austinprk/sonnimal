import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-white font-bold mb-4">손님말</h5>
            <p className="text-sm">
              음식점 사장님을 위한
              <br />
              리뷰 분석 서비스
            </p>
          </div>
          <div>
            <h6 className="text-white font-semibold mb-3">서비스</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white">
                  기능 소개
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white">
                  요금제
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="text-white font-semibold mb-3">고객지원</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="text-white font-semibold mb-3">회사</h6>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 손님말. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
