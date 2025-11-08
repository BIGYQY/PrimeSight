"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Survey {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_private: boolean;
  response_count?: number;
}

export default function MySurveys() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 获取我发布的问卷列表
   */
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        // 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 获取用户创建的问卷
        const { data: surveysData, error } = await supabase
          .from('surveys')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('获取问卷失败:', error);
          return;
        }

        // 获取每个问卷的回答人数
        const surveysWithCount = await Promise.all(
          (surveysData || []).map(async (survey) => {
            const { count } = await supabase
              .from('responses')
              .select('user_id', { count: 'exact', head: true })
              .eq('survey_id', survey.id);

            return {
              ...survey,
              response_count: count || 0,
            };
          })
        );

        setSurveys(surveysWithCount);
      } catch (err) {
        console.error('加载问卷失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  /**
   * 删除问卷
   */
  const handleDelete = async (surveyId: string) => {
    if (!confirm('确定要删除这个问卷吗？删除后无法恢复！')) return;

    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);

    if (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
      return;
    }

    // 从列表中移除
    setSurveys(surveys.filter(s => s.id !== surveyId));
  };

  /**
   * 跳转到创建问卷页面
   */
  const handleCreateSurvey = () => {
    router.push('/create-survey');
  };

  /**
   * 编辑问卷
   */
  const handleEdit = (surveyId: string) => {
    router.push(`/edit-survey/${surveyId}`);
  };

  /**
   * 查看统计
   */
  const handleStats = (surveyId: string) => {
    router.push(`/survey-stats/${surveyId}`);
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h1 className="text-3xl font-bold text-white">我发布的</h1>
        <button
          onClick={handleCreateSurvey}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
        >
          <span className="text-xl">➕</span>
          发布问卷
        </button>
      </div>

      {/* 问卷列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-8xl mb-6">📋</div>
            <h2 className="text-2xl font-bold text-white mb-3">还没有问卷</h2>
            <p className="text-white/60 mb-6">点击右上角的"发布问卷"按钮创建你的第一个问卷吧！</p>
            <button
              onClick={handleCreateSurvey}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
            >
              立即创建
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  {/* 左侧信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{survey.title}</h3>
                      {survey.is_private && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg border border-yellow-500/30">
                          🔒 私密
                        </span>
                      )}
                    </div>
                    {survey.description && (
                      <p className="text-white/60 mb-3 line-clamp-2">{survey.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span>📅 {formatDate(survey.created_at)}</span>
                      <span>👤 {survey.response_count} 人填写</span>
                    </div>
                  </div>

                  {/* 右侧操作按钮 */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(survey.id)}
                      className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleStats(survey.id)}
                      className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all border border-green-500/30"
                    >
                      统计
                    </button>
                    <button
                      onClick={() => handleDelete(survey.id)}
                      className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all border border-red-500/30"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
