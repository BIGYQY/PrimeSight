"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchSurveys from "@/components/SearchSurveys";
import MySurveys from "@/components/MySurveys";
import CompletedSurveys from "@/components/CompletedSurveys";

export default function DashboardPage() {
  // 当前激活的导航项 - 默认显示"我的问卷"
  const [activeNav, setActiveNav] = useState("my-surveys");

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* 右侧垂直导航栏 */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto">
        {activeNav === "my-surveys" && <MySurveys />}

        {activeNav === "search" && <SearchSurveys />}

        {activeNav === "completed" && <CompletedSurveys />}

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
