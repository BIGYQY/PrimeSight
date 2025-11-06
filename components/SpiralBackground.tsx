"use client";

import { useEffect, useState } from "react";

export default function SpiralBackground() {
  // 存储粒子数据，初始为空数组
  const [particles, setParticles] = useState<Array<{
    top: string;
    left: string;
    delay: string;
    duration: string;
  }>>([]);

  // 只在客户端生成粒子
  useEffect(() => {
    const newParticles = [...Array(30)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
    }));
    setParticles(newParticles);
  }, []); // 空依赖数组，只执行一次

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
      {/* 主漩涡 - 蓝紫色 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-blue-500/30 via-purple-600/20 to-transparent animate-spin-slow blur-3xl"></div>
      </div>

      {/* 第二层漩涡 - 反向旋转 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-purple-500/30 via-blue-600/20 to-transparent animate-spin-reverse blur-2xl"></div>
      </div>

      {/* 第三层漩涡 - 快速旋转 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-cyan-400/40 via-indigo-500/30 to-transparent animate-spin-fast blur-xl"></div>
      </div>

      {/* 漩涡臂 - 创造螺旋效果 */}
      <div className="absolute inset-0">
        {/* 臂 1 */}
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent -translate-x-1/2 -translate-y-1/2 origin-left animate-spin-slow"></div>

        {/* 臂 2 */}
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent -translate-x-1/2 -translate-y-1/2 origin-left animate-spin-reverse rotate-60"></div>

        {/* 臂 3 */}
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent -translate-x-1/2 -translate-y-1/2 origin-left animate-spin-fast rotate-120"></div>
      </div>

      {/* 粒子效果 - 只在客户端渲染 */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-float"
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* 半透明遮罩 - 让文字更清晰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/70"></div>
    </div>
  );
}
