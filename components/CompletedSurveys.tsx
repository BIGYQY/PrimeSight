"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface CompletedSurvey {
  id: string;
  title: string;
  description: string;
  created_at: string;
  creator_id: string;
  creator_name?: string;
  completed_at: string;
  is_private: boolean;
}

export default function CompletedSurveys() {
  const router = useRouter();
  const [completedSurveys, setCompletedSurveys] = useState<CompletedSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 获取用户完成的问卷
   */
  useEffect(() => {
    const fetchCompletedSurveys = async () => {
      try {
        // 1. 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // 2. 获取用户填写过的所有问卷 ID（去重）
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('survey_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (responsesError) {
          console.error('获取填写记录失败:', responsesError);
          setIsLoading(false);
          return;
        }

        // 去重，只保留每个问卷的第一条记录（最新的）
        const uniqueSurveyIds = new Map<string, string>();
        (responsesData || []).forEach(response => {
          if (!uniqueSurveyIds.has(response.survey_id)) {
            uniqueSurveyIds.set(response.survey_id, response.created_at);
          }
        });

        // 3. 获取这些问卷的详细信息
        if (uniqueSurveyIds.size === 0) {
          setCompletedSurveys([]);
          setIsLoading(false);
          return;
        }

        const surveyIds = Array.from(uniqueSurveyIds.keys());
        const { data: surveysData, error: surveysError } = await supabase
          .from('surveys')
          .select('*')
          .in('id', surveyIds);

        if (surveysError) {
          console.error('获取问卷信息失败:', surveysError);
          setIsLoading(false);
          return;
        }

        // 4. 获取所有创建者的 profiles
        const creatorIds = [...new Set(surveysData?.map(s => s.creator_id) || [])];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', creatorIds);

        if (profilesError) {
          console.error('获取 profiles 失败:', profilesError);
        }

        // 创建 creatorId -> displayName 的映射
        const profilesMap: Record<string, string> = {};
        (profilesData || []).forEach(profile => {
          profilesMap[profile.user_id] = profile.display_name;
        });

        // 5. 合并数据，添加完成时间和创建者昵称
        const completedSurveysWithTime = (surveysData || []).map(survey => ({
          ...survey,
          completed_at: uniqueSurveyIds.get(survey.id) || survey.created_at,
          creator_name: profilesMap[survey.creator_id] || '未知用户',
        }));

        // 按完成时间排序
        completedSurveysWithTime.sort((a, b) =>
          new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        );

        setCompletedSurveys(completedSurveysWithTime);
      } catch (err) {
        console.error('加载完成的问卷失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedSurveys();
  }, []);

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

  /**
   * 查看我的回答
   */
  const handleViewMyAnswers = (surveyId: string) => {
    // TODO: 跳转到查看回答页面（之后实现）
    alert('查看回答功能开发中...');
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
        <h1 className="text-3xl font-bold text-white">完成的问卷 ✅</h1>
        <span className="text-white/50">
          共完成 {completedSurveys.length} 个问卷
        </span>
      </div>

      {/* 问卷列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        {completedSurveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-8xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-white mb-3">还没有填写过问卷</h2>
            <p className="text-white/60 mb-6">去"查找问卷"页面找些感兴趣的问卷填写吧！</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
            >
              返回主页
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {completedSurveys.map((survey) => (
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
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
                        ✅ 已完成
                      </span>
                    </div>
                    {survey.description && (
                      <p className="text-white/60 mb-3 line-clamp-2">{survey.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span>👤 {survey.creator_name || '未知用户'}</span>
                      <span>📅 完成于 {formatDate(survey.completed_at)}</span>
                    </div>
                  </div>

                  {/* 右侧操作按钮 */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewMyAnswers(survey.id)}
                      className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30"
                    >
                      查看回答
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
