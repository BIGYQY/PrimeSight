"use client"; // 标记这是客户端组件

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import EyeLogo from "@/components/EyeLogo";
import AboutModal from "@/components/AboutModal";
import OnboardingModal from "@/components/OnboardingModal";
import { supabase } from "@/lib/supabase/client";

// 动态导入背景组件，禁用 SSR（服务端渲染）
// 这样就不会有 Hydration 错误了！
const SpiralBackground = dynamic(
  () => import("@/components/SpiralBackground"),
  { ssr: false } // ssr: false = 只在客户端渲染
);

// 主页面内容组件（需要 useSearchParams）
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 控制"关于我"弹窗的显示状态
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  // 控制"新用户引导"弹窗的显示状态
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  // 加载状态（处理邮箱确认时显示）
  const [isProcessing, setIsProcessing] = useState(false);
  // 标记是否已经处理过确认码（防止重复处理）
  const [hasProcessedCode, setHasProcessedCode] = useState(false);

  /**
   * 处理邮箱确认链接
   * 当用户点击邮箱中的确认链接时，URL 会包含 code 参数
   */
  useEffect(() => {
    // 如果已经处理过，就不再处理
    if (hasProcessedCode) {
      return;
    }

    const handleEmailConfirmation = async () => {
      // 检查 URL 中是否有错误信息
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error("邮箱确认出错:", error, errorDescription);
        // 不用 alert，直接在控制台输出
        return;
      }

      // 检查是否有确认码
      const code = searchParams.get('code');

      if (code) {
        console.log("检测到邮箱确认码:", code);
        setHasProcessedCode(true); // 标记为已处理
        setIsProcessing(true);

        try {
          // 用 code 换取 session（关键！）
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("exchangeCodeForSession 失败:", exchangeError);
            setIsProcessing(false);
            // 不用 alert，让用户自己手动登录
            return;
          }

          console.log("exchangeCodeForSession 成功:", data);

          if (data.session) {
            console.log("邮箱确认成功，已自动登录，即将跳转...");
            // 跳转到 dashboard
            router.push('/dashboard');
          } else {
            console.log("Session 为空");
            setIsProcessing(false);
          }
        } catch (err) {
          console.error("处理确认码时出错:", err);
          setIsProcessing(false);
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router, hasProcessedCode]); // 移除 isProcessing 依赖

  // 单独的 useEffect 监听认证状态
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("认证状态变化:", event, session);

      // 如果检测到登录，且正在处理确认流程，自动跳转
      if (event === 'SIGNED_IN' && session && isProcessing) {
        console.log("检测到登录成功，跳转到 dashboard");
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, isProcessing]); // 独立的依赖项

  // 如果正在处理邮箱确认，显示加载界面
  if (isProcessing) {
    return (
      <>
        <SpiralBackground />
        <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <EyeLogo />
            </div>
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-3">
              正在确认邮箱...
            </h2>
            <p className="text-white/70">
              请稍候，即将跳转到主页
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* 动态漩涡背景 */}
      <SpiralBackground />

      {/* 主内容 - 向上移动，不完全居中 */}
      <main className="relative flex min-h-screen flex-col items-center justify-start pt-32 p-24">
        <div className="text-center">
          {/* 眼睛 Logo */}
          <div className="flex justify-center">
            <EyeLogo />
          </div>

          {/* 标题 - 带神秘光芒闪烁效果 + 字间距 */}
          <h1 className="text-8xl font-bold mb-4 text-shimmer tracking-widest leading-tight py-4 overflow-visible drop-shadow-2xl">
            PrimeSight
          </h1>

          {/* 副标题 */}
          <p className="text-3xl text-white/90 mb-2 font-medium tracking-wide drop-shadow-lg">
            顶级视野
          </p>

          {/* 标语 */}
          <p className="text-lg text-white/70 mb-12 tracking-wide drop-shadow-md">
            洞查一切，追求卓越！ ————  BIGYQY
          </p>

          {/* 按钮组 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setIsOnboardingOpen(true)} // 点击打开新用户引导
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
            >
              开始使用
            </button>
            <button
              onClick={() => setIsAboutOpen(true)} // 点击打开弹窗
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/20 hover:scale-105"
            >
              了解更多
            </button>
          </div>
        </div>
      </main>

      {/* 关于我弹窗 */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* 新用户引导弹窗 */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </>
  );
}

// 默认导出 - 用 Suspense 包裹 HomeContent
export default function Home() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/70">加载中...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
