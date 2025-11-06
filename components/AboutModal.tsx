"use client";

import { useEffect, useState } from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  // 控制放大的二维码
  const [enlargedQR, setEnlargedQR] = useState<'wechat' | 'alipay' | null>(null);

  // 按 ESC 键关闭弹窗
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (enlargedQR) {
          setEnlargedQR(null); // 先关闭放大的二维码
        } else {
          onClose(); // 再关闭整个弹窗
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, enlargedQR]);

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-up border border-white/10 scrollbar-hide"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* 头像区域 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                  <img
                    src="/MyProfile%201.png"
                    alt="BIGYQY"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 标题 */}
            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              关于这个目前弱小的伟大的作者
            </h2>
            <p className="text-center text-white/60 mb-6">BIGYQY</p>

            {/* 故事区域 */}
            <div className="prose prose-invert max-w-none mb-8">
              <div className="text-white/80 space-y-4 text-base leading-relaxed">
                <p>
                  👋 你好！我是 <span className="text-blue-400 font-semibold">BIGYQY</span>，
                  PrimeSight 的创造者
                </p>

                <p>
                  💡 这个项目诞生于一个简单的想法：
                  <span className="text-purple-400 font-semibold">
                    让每一份问卷都有价值，让每一次调查都卓越，节省双方对接沟通的时间，提升效率！
                  </span>
                </p>

                <p>
                  🚀 在这里，你可以：
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                  <li>创建精美的问卷，收集真实的反馈</li>
                  <li>查看实时的数据统计和可视化图表</li>
                  <li>随时修改和完善你的问卷</li>
                  <li>快速与甲方达成初始协议</li>
                  <li>节省时间，追求卓越！</li>
                </ul>

                <p className="text-sm text-white/50 italic border-l-4 border-blue-500 pl-4 py-2 bg-white/5 rounded">
                  🧐 关于我的故事：我目前没有故事！因为还只是一个毫不起眼的小人物，但是我根本不在乎！因为以后I&apos;ll improve everything！

                  🫡 我的同伴：克劳德，我最强的助手，我最锋利的矛😤
                </p>
              </div>
            </div>

            {/* 收款码区域 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                🤗也许你有能力支持我一下？
              </h3>

              <div className="flex justify-center gap-6 flex-wrap">
                {/* 微信收款码 */}
                <div className="text-center">
                  <button
                    onClick={() => setEnlargedQR('wechat')}
                    className="cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    {/* 二维码 */}
                    <div className="w-40 h-40 rounded-lg overflow-hidden shadow-lg">
                      <img
                        src="/WeChatReciveMoneny.jpg"
                        alt="微信收款码"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                  <p className="text-white/60 text-sm mt-2">微信</p>
                </div>

                {/* 支付宝收款码 */}
                <div className="text-center">
                  <button
                    onClick={() => setEnlargedQR('alipay')}
                    className="cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    {/* 二维码 */}
                    <div className="w-40 h-40 rounded-lg overflow-hidden shadow-lg">
                      <img
                        src="/ZhiFuBaoReciveMoneny%201.png"
                        alt="支付宝收款码"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                  <p className="text-white/60 text-sm mt-2">支付宝</p>
                </div>
              </div>

              <p className="text-white/50 text-sm text-center mt-4">
                你的支持是我保持卓越（赛博讨饭）的动力！😋
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 放大的二维码弹窗 */}
      {enlargedQR && (
        <>
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] animate-fade-in"
            onClick={() => setEnlargedQR(null)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto animate-slide-up text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                🙏 感谢你的支持！
              </h3>
              <div className="bg-white rounded-2xl p-4 shadow-2xl max-w-md">
                <img
                  src={enlargedQR === 'wechat' ? '/WeChatReciveMoneny.jpg' : '/ZhiFuBaoReciveMoneny%201.png'}
                  alt={enlargedQR === 'wechat' ? '微信收款码' : '支付宝收款码'}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <p className="text-white/60 text-sm mt-4">
                点击任意处关闭 或 按 ESC 键
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
