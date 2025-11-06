"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchSurveys from "@/components/SearchSurveys";

export default function DashboardPage() {
  // 当前激活的导航项
  const [activeNav, setActiveNav] = useState("search");

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* 右侧垂直导航栏 */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto">
        {activeNav === "search" && <SearchSurveys />}

        {activeNav === "completed" && (
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-8">完成的问卷</h1>
            <div className="text-white/60">正在开发中...</div>
          </div>
        )}

        {activeNav === "publish" && (
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-8">发布问卷</h1>
            <div className="text-white/60">正在开发中...</div>
          </div>
        )}

        {activeNav === "support" && (
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-8">支持我们</h1>
            <div className="text-white/60">正在开发中...</div>
          </div>
        )}
      </main>
    </div>
  );
}
