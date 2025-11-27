import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LoginPageProps {
  onLogin: (name: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (email && password) {
      onLogin("김건강");
    }
  };

  const handleAdminLogin = () => {
    onLogin("관리자");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#E8F8F7] flex justify-center items-center px-5">
      <div className="w-full max-w-[500px]">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center">
            <svg
              width="124"
              height="126"
              viewBox="0 0 124 126"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M62.0707 24.7058C62.1252 24.736 93.4859 42.0624 105.825 60.7984C105.899 60.9251 111.035 43.507 111.109 43.6335C121.553 61.1944 113.004 100.204 98.2501 109.129C89.1963 114.608 77.987 108.162 68.273 100.729C75.3797 104.577 89.1476 107.151 95.6596 102.643C106.984 94.8055 103.85 73.4955 95.8344 58.0758C95.7773 57.9646 95.7167 57.8616 95.6596 57.7507C86.1817 41.2872 73.8688 69.1764 62.0688 69.5349C50.2687 69.8931 39.883 40.276 29.1415 56.6387C28.8739 57.1078 28.6094 57.5856 28.3561 58.0714C20.3366 73.4952 17.8209 94.8055 29.1415 102.643C35.6122 107.122 48.7027 104.578 55.7766 100.801C46.0932 108.203 34.958 114.59 25.9332 109.129C11.1845 100.203 1.27028 62.9058 11.718 45.3402C12.0481 44.7867 18.8147 60.0671 19.1633 59.5327C33.1602 40.8938 61.9809 24.7562 62.0707 24.7058Z"
                fill="#70DADA"
              />
              <path
                d="M28.3561 58.0714C28.6094 57.5856 28.8739 57.1078 29.1415 56.6387C34.8378 47.9612 46.1944 58.0714 46.1944 58.0714L62.0707 24.7058C62.0707 24.7058 33.1602 40.8938 19.1633 59.5327C18.8147 60.0671 12.0481 44.7867 11.718 45.3402C1.27027 62.9058 11.1845 100.203 25.9332 109.129C34.958 114.59 46.0932 108.203 55.7766 100.801C48.7027 104.578 35.6122 107.122 29.1415 102.643C17.8209 94.8055 20.3366 73.4952 28.3561 58.0714Z"
                fill="#2ECACA"
              />
              <path
                d="M19.1633 59.5317C18.8147 60.0663 12.0481 44.786 11.718 45.3391C3.51913 59.1238 7.85988 85.0603 17.2361 99.9008C13.186 93.1122 7.90114 75.5344 19.1633 59.5317Z"
                fill="#239C9C"
              />
              <path
                d="M87.6123 76.8196C87.6123 81.0688 84.0033 84.5135 79.5515 84.5135C75.0997 84.5135 71.4907 81.0688 71.4907 76.8196C71.4907 72.5705 75.0997 69.1257 79.5515 69.1257C84.0033 69.1257 87.6123 72.5705 87.6123 76.8196Z"
                fill="#555A66"
              />
              <path
                d="M49.9946 76.8196C49.9946 81.0688 46.5861 84.5135 42.3815 84.5135C38.1769 84.5135 34.7686 81.0688 34.7686 76.8196C34.7686 72.5705 38.1769 69.1257 42.3815 69.1257C46.5861 69.1257 49.9946 72.5705 49.9946 76.8196Z"
                fill="#555A66"
              />
              <path
                d="M68.8772 87.7363C68.8772 91.9857 65.4686 95.4302 61.264 95.4302C57.0594 95.4302 53.6511 91.9857 53.6511 87.7363C53.6511 83.4872 57.0594 92.5579 61.264 92.5579C65.4686 92.5579 68.8772 83.4872 68.8772 87.7363Z"
                fill="#AEAEAE"
              />
              <path
                d="M39.3967 72.8825C39.3967 74.247 40.4991 75.353 41.859 75.353C43.2189 75.353 44.3213 74.247 44.3213 72.8825C44.3213 71.5179 43.2189 70.4119 41.859 70.4119C40.4991 70.4119 39.3967 71.5179 39.3967 72.8825Z"
                fill="#BBBDC2"
              />
              <path
                d="M76.3311 72.8825C76.3311 74.247 77.4334 75.353 78.7933 75.353C80.1533 75.353 81.2556 74.247 81.2556 72.8825C81.2556 71.5179 80.1533 70.4119 78.7933 70.4119C77.4334 70.4119 76.3311 71.5179 76.3311 72.8825Z"
                fill="#BBBDC2"
              />
            </svg>
          </div>
          <h1 className="text-[#1A1A1A] mb-2">wellio</h1>
          <p className="text-gray-500">
            지금 웰리오를 가입하고 가족과 건강을 나누세요!
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[#1A1A1A] block"
              >
                이메일
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#36D2C5] focus:ring-[#36D2C5]"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[#1A1A1A] block"
              >
                비밀번호
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-[#36D2C5] focus:ring-[#36D2C5]"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#36D2C5] focus:ring-[#36D2C5]"
                />
                <span className="text-gray-600">
                  로그인 유지
                </span>
              </label>
              <button
                type="button"
                className="text-[#36D2C5] hover:text-[#00C2B3]"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-15 bg-[#36D2C5] hover:bg-[#00C2B3] text-white rounded-xl transition-colors text-[17px]"
            >
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-500">
                또는
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              아직 회원이 아니신가요?{" "}
              <button className="text-[#36D2C5] hover:text-[#00C2B3]">
                회원가입
              </button>
            </p>
          </div>
        </div>

        {/* Admin Quick Login */}
        <div className="mt-6 text-center">
          <button
            onClick={handleAdminLogin}
            className="text-gray-400 hover:text-[#36D2C5] text-sm transition-colors underline"
          >
            테스트용 관리자 계정으로 진입하기
          </button>
        </div>
      </div>
    </div>
  );
}