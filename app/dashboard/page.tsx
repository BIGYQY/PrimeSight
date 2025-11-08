"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchSurveys from "@/components/SearchSurveys";
import MySurveys from "@/components/MySurveys";
import CompletedSurveys from "@/components/CompletedSurveys";
import SupportUs from "@/components/SupportUs";

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

        {activeNav === "support" && <SupportUs />}
      </main>
    </div>
  );
}
