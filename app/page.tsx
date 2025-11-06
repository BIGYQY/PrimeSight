"use client"; // 标记这是客户端组件

import { useState } from "react";
import dynamic from "next/dynamic";
import EyeLogo from "@/components/EyeLogo";
import AboutModal from "@/components/AboutModal";
import OnboardingModal from "@/components/OnboardingModal";

// 动态导入背景组件，禁用 SSR（服务端渲染）
// 这样就不会有 Hydration 错误了！
const SpiralBackground = dynamic(
  () => import("@/components/SpiralBackground"),
  { ssr: false } // ssr: false = 只在客户端渲染
);

export default function Home() {
  // 控制"关于我"弹窗的显示状态
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  // 控制"新用户引导"弹窗的显示状态
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

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
