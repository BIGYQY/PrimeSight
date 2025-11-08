"use client";

import { useEffect, useState } from "react";

export default function SpiralBackground() {
  const [mounted, setMounted] = useState(false);

  // 星星数据
  const [stars, setStars] = useState<Array<{
    top: string;
    left: string;
    size: number;
    baseOpacity: number;
    twinkleDuration: string;
    driftDuration: string;
    isBright: boolean;
  }>>([]);

  // 生成星星
  useEffect(() => {
    setMounted(true);
    const newStars = [...Array(200)].map(() => {
      const isBright = Math.random() > 0.9;
      return {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: isBright ? 2.5 + Math.random() * 1.5 : 1 + Math.random() * 1.5,
        baseOpacity: isBright ? 0.8 : 0.3 + Math.random() * 0.5,
        twinkleDuration: `${2 + Math.random() * 4}s`,
        driftDuration: `${8 + Math.random() * 12}s`,
        isBright,
      };
    });
    setStars(newStars);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 overflow-hidden bg-black" />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* 星星 - 会闪烁移动 */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute animate-drift"
            style={{
              top: star.top,
              left: star.left,
              animationDuration: star.driftDuration,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <div
              className={`bg-white rounded-full animate-twinkle ${
                star.isBright ? "shadow-[0_0_6px_rgba(255,255,255,0.6)]" : ""
              }`}
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.baseOpacity,
                animationDuration: star.twinkleDuration,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

