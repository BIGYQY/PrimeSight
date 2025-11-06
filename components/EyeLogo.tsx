"use client"; // 这是客户端组件（需要用到动画）

import { useEffect, useState } from "react";

export default function EyeLogo() {
  // 控制眼睛是否眨眼的状态
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // 每隔 3-5 秒随机眨一次眼
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      // 眨眼动画持续 200ms
      setTimeout(() => setIsBlinking(false), 200);
    }, Math.random() * 2000 + 3000); // 3-5秒随机

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative w-32 h-32 mb-8">
      {/* 外层光晕效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>

      {/* SVG 眼睛 */}
      <svg
        viewBox="0 0 200 200"
        className="relative z-10 w-full h-full drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 外圈眼眶（渐变） */}
        <defs>
          <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* 眼睛光泽效果 */}
          <radialGradient id="shine">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 眼睛外轮廓 - 椭圆形 */}
        <ellipse
          cx="100"
          cy="100"
          rx="80"
          ry={isBlinking ? "5" : "50"} // 眨眼时高度变小
          fill="url(#eyeGradient)"
          className="transition-all duration-200 ease-out"
        />

        {/* 眼白 */}
        {!isBlinking && (
          <ellipse
            cx="100"
            cy="100"
            rx="65"
            ry="40"
            fill="white"
            className="animate-pulse"
          />
        )}

        {/* 虹膜（渐变蓝紫色） */}
        {!isBlinking && (
          <circle
            cx="100"
            cy="100"
            r="25"
            fill="url(#eyeGradient)"
            className="animate-pulse"
          />
        )}

        {/* 瞳孔（黑色） */}
        {!isBlinking && (
          <circle cx="100" cy="100" r="12" fill="#1a1a1a" />
        )}

        {/* 高光点（让眼睛有神） */}
        {!isBlinking && (
          <>
            <circle cx="110" cy="90" r="6" fill="url(#shine)" />
            <circle cx="95" cy="95" r="3" fill="white" opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}
