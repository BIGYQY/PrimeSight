"use client";

import { useState } from "react";

export default function SearchSurveys() {
  const [searchQuery, setSearchQuery] = useState("");

  // 模拟问卷数据（之后会从 Supabase 获取）
  const mockSurveys = [
    {
      id: 1,
      title: "用户体验调查问卷",
      description: "帮助我们了解您的使用体验，改进我们的产品",
      author: "产品团队",
      questions: 10,
      responses: 245,
      createdAt: "2024-11-01",
    },
    {
      id: 2,
      title: "2024年度员工满意度调查",
      description: "收集员工对公司环境、福利和发展的反馈",
      author: "HR部门",
      questions: 15,
      responses: 128,
      createdAt: "2024-10-28",
    },
    {
      id: 3,
      title: "新功能需求调研",
      description: "您希望我们开发什么新功能？您的意见很重要！",
      author: "开发团队",
      questions: 8,
      responses: 532,
      createdAt: "2024-10-25",
    },
    {
      id: 4,
      title: "课程反馈问卷",
      description: "帮助我们改进课程质量，提供更好的学习体验",
      author: "教育部",
      questions: 12,
      responses: 89,
      createdAt: "2024-10-20",
    },
  ];

  // 过滤问卷
  const filteredSurveys = mockSurveys.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">查找问卷 🔍</h1>
        <p className="text-white/60">发现感兴趣的问卷，参与调查</p>
      </div>

      {/* 搜索框 */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索问卷标题或描述..."
            className="w-full px-6 py-4 pl-14 bg-slate-800 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg"
          />
          {/* 搜索图标 */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">
            🔍
          </div>
        </div>
      </div>

      {/* 问卷列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSurveys.length > 0 ? (
          filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
            >
              {/* 问卷标题 */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {survey.title}
              </h3>

              {/* 问卷描述 */}
              <p className="text-white/60 text-sm mb-4 line-clamp-2">
                {survey.description}
              </p>

              {/* 问卷信息 */}
              <div className="flex items-center gap-4 mb-4 text-white/50 text-sm">
                <div className="flex items-center gap-1">
                  <span>👤</span>
                  <span>{survey.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📝</span>
                  <span>{survey.questions} 个问题</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📊</span>
                  <span>{survey.responses} 人已填</span>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-white/40 text-xs">
                  {survey.createdAt}
                </span>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg text-sm font-medium">
                  开始填写 →
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-white/60 text-lg">
              没有找到相关问卷，试试其他关键词吧
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
