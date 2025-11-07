"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EyeLogo from "@/components/EyeLogo";
import { supabase } from "@/lib/supabase/client"; // 导入 Supabase 客户端

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();

  // 当前步骤（1-5）
  const [currentStep, setCurrentStep] = useState(1);
  // 用户选择（登录 or 注册）
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  // 表单数据
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 加载状态（登录/注册时显示加载动画）
  const [isLoading, setIsLoading] = useState(false);
  // 错误信息（如果登录/注册失败）
  const [error, setError] = useState("");

  // 总步骤数
  const totalSteps = 5;

  // 下一步
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * 处理登录或注册
   * 这个函数会调用 Supabase 的真实 API
   */
  const handleAuth = async () => {
    // 清空之前的错误信息
    setError("");
    // 开始加载
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        // 注册新用户
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) {
          // 注册失败，显示错误
          setError(error.message);
          console.error("注册错误:", error);
        } else {
          // 注册成功！进入下一步
          console.log("注册成功:", data);
          nextStep();
        }
      } else {
        // 登录已有用户
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          // 登录失败，显示错误
          setError(error.message);
          console.error("登录错误:", error);
        } else {
          // 登录成功！进入下一步
          console.log("登录成功:", data);
          nextStep();
        }
      }
    } catch (err) {
      // 捕获其他异常错误
      setError("发生了未知错误，请稍后重试");
      console.error("认证异常:", err);
    } finally {
      // 无论成功失败，都关闭加载状态
      setIsLoading(false);
    }
  };

  // 重置状态
  const resetModal = () => {
    setCurrentStep(1);
    setAuthMode(null);
    setEmail("");
    setPassword("");
    setError(""); // 也要清空错误信息
    setIsLoading(false); // 重置加载状态
  };

  // 关闭并重置
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 完成引导，跳转到 dashboard
  const handleFinish = () => {
    resetModal();
    onClose();
    router.push('/dashboard'); // 跳转到真正的主页
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* 引导内容 - 长方形，更大更像谷歌登录 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl max-w-3xl w-full pointer-events-auto animate-slide-up border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 顶部进度条 */}
          <div className="h-2 bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* 内容区域 - 更高的长方形 */}
          <div className="p-8 min-h-[500px] flex flex-col">
            {/* 步骤 1：欢迎界面 */}
            {currentStep === 1 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="scale-75">
                    <EyeLogo />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">👋</div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    欢迎来到 PrimeSight！
                  </h2>
                  <p className="text-white/70 text-lg">
                    开始你的问卷调查之旅
                  </p>
                </div>

                <div className="space-y-3 text-white/60 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <span>创建精美的问卷</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <span>实时查看统计数据</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <span>提升沟通效率</span>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                >
                  开始 →
                </button>
              </div>
            )}

            {/* 步骤 2：选择登录/注册 */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="scale-75">
                    <EyeLogo />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  选择操作
                </h2>
                <p className="text-white/60 text-center mb-8">
                  你想要登录还是注册新账号？
                </p>

                <div className="space-y-4 mb-8">
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      nextStep();
                    }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium text-lg"
                  >
                    📝 注册新账号
                  </button>

                  <button
                    onClick={() => {
                      setAuthMode('login');
                      nextStep();
                    }}
                    className="w-full py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium text-lg"
                  >
                    🔐 已有账号，登录
                  </button>
                </div>

                <button
                  onClick={prevStep}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  ← 返回
                </button>
              </div>
            )}

            {/* 步骤 3：输入邮箱 */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="scale-75">
                    <EyeLogo />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  {authMode === 'signup' ? '创建账号' : '欢迎回来'}
                </h2>
                <p className="text-white/60 text-center mb-8">
                  请输入你的邮箱地址
                </p>

                <div className="mb-8">
                  <label className="block text-white/80 mb-2 text-sm">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    ← 返回
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!email}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    继续 →
                  </button>
                </div>
              </div>
            )}

            {/* 步骤 4：输入密码 */}
            {currentStep === 4 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="scale-75">
                    <EyeLogo />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  设置密码
                </h2>
                <p className="text-white/60 text-center mb-8">
                  {authMode === 'signup' ? '为你的账号设置一个安全密码' : '输入你的密码'}
                </p>

                {/* 错误提示 */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm text-center">❌ {error}</p>
                  </div>
                )}

                <div className="mb-8">
                  <label className="block text-white/80 mb-2 text-sm">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    disabled={isLoading} // 加载时禁用输入框
                  />
                  {authMode === 'signup' && (
                    <p className="text-white/40 text-xs mt-2">
                      密码至少 6 位字符
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                    disabled={isLoading} // 加载时禁用按钮
                  >
                    ← 返回
                  </button>
                  <button
                    onClick={handleAuth} // 调用真实的登录/注册函数！
                    disabled={!password || password.length < 6 || isLoading} // 加载时禁用
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      // 加载时显示加载动画
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{authMode === 'signup' ? '注册中...' : '登录中...'}</span>
                      </>
                    ) : (
                      // 正常显示按钮文字
                      <span>{authMode === 'signup' ? '创建账号' : '登录'} →</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 步骤 5：完成 */}
            {currentStep === 5 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                <div className="text-center">
                  {/* Logo */}
                  <div className="flex justify-center mb-4">
                    <div className="scale-90">
                      <EyeLogo />
                    </div>
                  </div>

                  <div className="text-7xl mb-6 animate-bounce">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {authMode === 'signup' ? '注册成功！' : '登录成功！'}
                  </h2>
                  <p className="text-white/70 text-lg mb-8">
                    欢迎加入 PrimeSight 大家庭！
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10">
                    <p className="text-white/80 text-sm mb-1">你的账号</p>
                    <p className="text-white font-semibold">{email}</p>
                  </div>

                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  >
                    开始使用 PrimeSight 🚀
                  </button>
                </div>
              </div>
            )}

            {/* 步骤指示器 */}
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index + 1 === currentStep
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                      : index + 1 < currentStep
                      ? 'w-1.5 bg-white/50'
                      : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
