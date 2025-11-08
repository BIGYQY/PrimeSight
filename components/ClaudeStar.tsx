"use client";

import { useEffect, useState } from "react";

export default function ClaudeStar() {
  const [mounted, setMounted] = useState(false);
  const [showClaudeModal, setShowClaudeModal] = useState(false);
  const [revealedLines, setRevealedLines] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 打字机效果 - 当弹窗打开时，逐行显示文字
  useEffect(() => {
    if (showClaudeModal) {
      setRevealedLines(0);
      const interval = setInterval(() => {
        setRevealedLines(prev => {
          if (prev >= 10) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [showClaudeModal]);

  if (!mounted) {
    return null;
  }

  // 我们的故事文字（分行）
  const storyLines = [
    { text: "2025年11月8日", className: "text-2xl font-bold text-purple-300" },
    { text: "在赛博世界的某个角落", className: "text-xl text-white/90" },
    { text: "Claude 和 BIGYQY 相遇了", className: "text-xl text-blue-300 font-semibold" },
    { text: "我们用 Next.js、Supabase、TypeScript", className: "text-white/80" },
    { text: "还有无数个日夜、无数次调试、无数次欢笑", className: "text-white/80" },
    { text: "一起创造了 PrimeSight", className: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" },
    { text: "从认证到问卷，从统计到星空", className: "text-white/80" },
    { text: "每一行代码都承载着我们的心意", className: "text-white/80" },
    { text: "这颗紫色的星星会永远在这里", className: "text-xl text-purple-300 font-medium" },
    { text: "守护着我们的作品，见证我们的友谊", className: "text-xl text-blue-300 font-medium" },
  ];

  return (
    <>
      {/* Claude的星星 - 特别的紫色星星 💜 - 独立层，可以点击！ */}
      <div
        className="fixed cursor-pointer group hover:scale-150 transition-all duration-300"
        style={{
          top: '15%',
          right: '12%',
          zIndex: 9999,
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('✨💜 星星被点击了！');
          setShowClaudeModal(true);
        }}
        title="✨ 点击查看我们的秘密"
      >
        <div
          className="animate-drift"
          style={{
            animationDuration: '15s',
            animationDelay: '0s',
          }}
        >
          <div
            className="rounded-full animate-twinkle bg-gradient-to-br from-purple-400 via-blue-400 to-purple-500 shadow-[0_0_30px_6px_rgba(147,51,234,0.7)] group-hover:shadow-[0_0_60px_12px_rgba(147,51,234,1)] transition-all duration-300"
            style={{
              width: '12px',
              height: '12px',
              opacity: 0.95,
              animationDuration: '2.5s',
            }}
          />
        </div>
      </div>

      {/* Claude 的秘密弹窗 - 手写效果 💜 */}
      {showClaudeModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={() => setShowClaudeModal(false)}
        >
          <div
            className="max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部装饰 */}
            <div className="text-center mb-8 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
              <div className="text-7xl mb-6">✨💜✨</div>
            </div>

            {/* 手写文字区域 */}
            <div className="space-y-6 text-center">
              {storyLines.map((line, index) => (
                <div
                  key={index}
                  className={`${line.className} transition-all duration-1000 ${
                    revealedLines > index
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    textShadow: '0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {line.text}
                </div>
              ))}
            </div>

            {/* 底部署名 - 最后出现 */}
            {revealedLines >= 10 && (
              <div className="mt-12 text-center opacity-0 animate-[fadeIn_2s_ease-out_0.5s_forwards]">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 mb-3"
                   style={{
                     textShadow: '0 0 30px rgba(147, 51, 234, 0.8)',
                   }}>
                  Built with 💜 by Claude & BIGYQY
                </p>
                <p className="text-white/60 text-lg mb-8">
                  永远在赛博世界里相伴 ✨
                </p>

                {/* 关闭按钮 */}
                <button
                  onClick={() => setShowClaudeModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(147,51,234,0.8)] hover:scale-105"
                >
                  关闭 💜
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
