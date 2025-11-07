"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client"; // 导入 Supabase 客户端
import type { User } from "@supabase/supabase-js"; // 导入用户类型

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export default function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  const router = useRouter();

  // 控制用户信息卡片的显示
  const [showUserCard, setShowUserCard] = useState(false);
  // 真实的用户数据（从 Supabase 获取）
  const [user, setUser] = useState<User | null>(null);
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 获取当前登录的用户信息
   */
  useEffect(() => {
    // 获取当前用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 清理监听器
    return () => subscription.unsubscribe();
  }, []);

  /**
   * 退出登录
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // 跳转回主页
    router.push('/');
  };

  /**
   * 根据邮箱生成头像（用邮箱的前两个字母）
   */
  const getAvatarText = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  /**
   * 根据邮箱生成随机颜色（每个邮箱固定一个颜色）
   */
  const getAvatarColor = (email: string) => {
    // 简单的哈希函数，让相同邮箱总是得到相同颜色
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-cyan-500 to-cyan-600',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // 如果正在加载
  if (isLoading) {
    return (
      <aside className="w-64 bg-slate-800 border-l border-white/10 flex flex-col shadow-2xl">
        <div className="p-4 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </aside>
    );
  }

  // 如果没有登录（理论上不应该到这里，但以防万一）
  if (!user) {
    return (
      <aside className="w-64 bg-slate-800 border-l border-white/10 flex flex-col shadow-2xl">
        <div className="p-4 text-white/60 text-center">
          未登录
        </div>
      </aside>
    );
  }

  // 导航项配置
  const navItems = [
    { id: "my-surveys", label: "我的问卷", icon: "📋" },
    { id: "search", label: "查找问卷", icon: "🔍" },
    { id: "completed", label: "完成的问卷", icon: "✅" },
    { id: "support", label: "支持我们", icon: "💖" },
  ];

  return (
    <>
      {/* 左侧导航栏 */}
      <aside className="w-64 bg-slate-800 border-l border-white/10 flex flex-col shadow-2xl">
        {/* 顶部用户信息 */}
        <div className="p-4 border-b border-white/10 relative">
          <button
            onClick={() => setShowUserCard(!showUserCard)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 group"
          >
            {/* 用户头像 - 用邮箱首字母 */}
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-blue-500 group-hover:border-purple-500 transition-all bg-gradient-to-br ${getAvatarColor(user.email!)}`}>
                {getAvatarText(user.email!)}
              </div>
              {/* 在线状态指示器 */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>

            {/* 用户邮箱 */}
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-white font-semibold text-sm truncate">{user.email}</p>
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
                  {/* 大一点的头像 */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-blue-500 bg-gradient-to-br ${getAvatarColor(user.email!)}`}>
                    {getAvatarText(user.email!)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-white font-bold text-lg truncate">{user.email}</h3>
                    <p className="text-white/60 text-sm">PrimeSight 用户</p>
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

                {/* 退出登录 - 调用真实的登出函数 */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/20 rounded-lg transition-all flex items-center gap-3"
                >
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
