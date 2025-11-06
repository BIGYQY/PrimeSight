"use client";

import { useState } from "react";

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export default function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  // 控制用户信息卡片的显示
  const [showUserCard, setShowUserCard] = useState(false);

  // 模拟用户数据（之后会从 Supabase 获取）
  const user = {
    name: "BIGYQY",
    email: "example@email.com",
    avatar: "/MyProfile%201.png", // 使用你的头像
  };

  // 导航项配置
  const navItems = [
    { id: "search", label: "查找问卷", icon: "🔍" },
    { id: "completed", label: "完成的问卷", icon: "✅" },
    { id: "publish", label: "发布问卷", icon: "📝" },
    { id: "support", label: "支持我们", icon: "💖" },
  ];

  return (
    <>
      {/* 右侧导航栏 */}
      <aside className="w-64 bg-slate-800 border-l border-white/10 flex flex-col shadow-2xl">
        {/* 顶部用户信息 */}
        <div className="p-4 border-b border-white/10 relative">
          <button
            onClick={() => setShowUserCard(!showUserCard)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group"
          >
            {/* 用户头像 */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg group-hover:border-purple-500 transition-all">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 在线状态指示器 */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>

            {/* 用户名 */}
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">{user.name}</p>
              <p className="text-white/50 text-xs">在线</p>
            </div>

            {/* 下拉箭头 */}
            <div className={`text-white/60 transition-transform duration-300 ${showUserCard ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>

          {/* 用户信息弹出卡片 - 在按钮下方 */}
          {showUserCard && (
            <div
              className="absolute top-full left-4 right-4 mt-2 z-50 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 卡片顶部 - 用户信息 */}
              <div className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{user.name}</h3>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* 卡片内容 */}
              <div className="p-4 space-y-2">
                <button className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 rounded-lg transition-all flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <span>个人资料</span>
                </button>

                <button className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 rounded-lg transition-all flex items-center gap-3">
                  <span className="text-xl">⚙️</span>
                  <span>设置</span>
                </button>

                <div className="border-t border-white/10 my-2"></div>

                {/* 退出登录 */}
                <button className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/20 rounded-lg transition-all flex items-center gap-3">
                  <span className="text-xl">🚪</span>
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 导航项列表 */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeNav === item.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 底部装饰 */}
        <div className="p-4 border-t border-white/10">
          <div className="text-center text-white/40 text-xs">
            PrimeSight v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
