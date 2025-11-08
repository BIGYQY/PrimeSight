"use client";

import { useState } from "react";

export default function SupportUs() {
  // 控制赞助弹窗
  const [showDonateModal, setShowDonateModal] = useState(false);

  /**
   * 复制分享链接
   */
  const handleShare = () => {
    navigator.clipboard.writeText('primesight.vercel.app');
    alert('✅ 链接已复制到剪贴板！');
  };

  /**
   * 发送反馈邮件
   */
  const handleFeedback = () => {
    window.location.href = 'mailto:vipnb668@qq.com?subject=PrimeSight 反馈&body=你好，我想反馈以下内容：';
  };

  return (
    <div className="p-8">
      {/* 顶部标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">支持我们 💖</h1>
        <p className="text-white/60">感谢你使用 PrimeSight，你的支持是我们前进的动力！</p>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 关于我们卡片 */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🏢</div>
            <h2 className="text-2xl font-bold text-white">关于我们</h2>
          </div>
          <p className="text-white/70 mb-4 leading-relaxed">
            PrimeSight 一款潜力无限的问卷调查网站，我们追求卓越，精准，效率，目前仍在进步开发
          </p>
          <div className="space-y-2 text-white/60">
            <p>📍 公司：JMN</p>
            <p>🌍 地址：地球</p>
            <p>📅 成立时间：2025年11月8号</p>
          </div>
        </div>

        {/* 联系我们卡片 */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">📧</div>
            <h2 className="text-2xl font-bold text-white">联系我们</h2>
          </div>
          <p className="text-white/70 mb-4">
            有任何问题或建议？欢迎随时联系我们！
          </p>
          <div className="space-y-3">
            <a
              href="mailto:vipnb668@qq.com"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>✉️</span>
              <span>vipnb668@qq.com</span>
            </a>
            <a
              href="https://github.com/BIGYQY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>💻</span>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* 支持方式 */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">💰</div>
          <h2 className="text-2xl font-bold text-white">支持方式</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 赞助 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-3xl mb-3 text-center">⭐</div>
            <h3 className="text-lg font-semibold text-white mb-2 text-center">项目赞助</h3>
            <p className="text-white/60 text-sm text-center mb-4">
              不论多少，我们都很感激！PrimeSight因你而存在！
            </p>
            <button
              onClick={() => setShowDonateModal(true)}
              className="w-full px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all font-medium"
            >
              赞助我们
            </button>
          </div>

          {/* 反馈 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-3xl mb-3 text-center">💡</div>
            <h3 className="text-lg font-semibold text-white mb-2 text-center">提供反馈</h3>
            <p className="text-white/60 text-sm text-center mb-4">
              分享你的使用体验和改进建议
            </p>
            <button
              onClick={handleFeedback}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              提交反馈
            </button>
          </div>

          {/* 分享 */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-3xl mb-3 text-center">📢</div>
            <h3 className="text-lg font-semibold text-white mb-2 text-center">分享推荐</h3>
            <p className="text-white/60 text-sm text-center mb-4">
              向朋友推荐 PrimeSight
            </p>
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
            >
              分享链接
            </button>
          </div>
        </div>
      </div>

      {/* 技术栈 */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">🚀</div>
          <h2 className="text-2xl font-bold text-white">技术栈</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl mb-2">⚛️</div>
            <p className="text-white font-medium">Next.js 15</p>
            <p className="text-white/40 text-xs mt-1">React 框架</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl mb-2">🎨</div>
            <p className="text-white font-medium">Tailwind CSS</p>
            <p className="text-white/40 text-xs mt-1">样式框架</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl mb-2">🗄️</div>
            <p className="text-white font-medium">Supabase</p>
            <p className="text-white/40 text-xs mt-1">后端服务</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl mb-2">📘</div>
            <p className="text-white font-medium">TypeScript</p>
            <p className="text-white/40 text-xs mt-1">类型安全</p>
          </div>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="mt-8 text-center text-white/40 text-sm">
        <p>PrimeSight v1.0 - Made with 💖 by JMN Team</p>
      </div>

      {/* 赞助弹窗 */}
      {showDonateModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDonateModal(false)}
        >
          <div
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-white mb-4 text-center">感谢你的支持！💖</h2>
            <p className="text-white/70 text-center mb-6">
              不论多少，我们都很感激！<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">
                PrimeSight因你而存在！
              </span>
            </p>

            {/* 收款码 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 微信 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
                  <span className="text-2xl">💚</span>
                  <span>微信支付</span>
                </h3>
                <img
                  src="/WeChatReciveMoneny.jpg"
                  alt="微信收款码"
                  className="w-full max-w-xs mx-auto rounded-lg border border-white/20"
                />
              </div>

              {/* 支付宝 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
                  <span className="text-2xl">💙</span>
                  <span>支付宝</span>
                </h3>
                <img
                  src="/ZhiFuBaoReciveMoneny.jpg"
                  alt="支付宝收款码"
                  className="w-full max-w-xs mx-auto rounded-lg border border-white/20"
                />
              </div>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={() => setShowDonateModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
