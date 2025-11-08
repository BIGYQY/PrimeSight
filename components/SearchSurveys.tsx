"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Survey {
  id: string;
  title: string;
  description: string;
  created_at: string;
  creator_id: string;
  is_private: boolean;
  creator_name?: string;
  question_count?: number;
  response_count?: number;
}

export default function SearchSurveys() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 密码验证弹窗
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [inputPassword, setInputPassword] = useState('');

  /**
   * 获取所有公开问卷
   */
  useEffect(() => {
    const fetchPublicSurveys = async () => {
      try {
        // 1. 获取所有问卷（包括公开和私密）
        const { data: surveysData, error: surveysError } = await supabase
          .from('surveys')
          .select('*')
          .order('created_at', { ascending: false });

        if (surveysError) {
          console.error('获取问卷失败:', surveysError);
          setIsLoading(false);
          return;
        }

        // 2. 获取所有创建者的 profiles
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

        // 3. 为每个问卷获取题目数和填写人数
        const surveysWithStats = await Promise.all(
          (surveysData || []).map(async (survey) => {
            // 获取题目数
            const { count: questionCount } = await supabase
              .from('questions')
              .select('id', { count: 'exact', head: true })
              .eq('survey_id', survey.id);

            // 获取填写人数（去重）
            const { data: responseData } = await supabase
              .from('responses')
              .select('user_id')
              .eq('survey_id', survey.id);

            const uniqueUsers = new Set(responseData?.map(r => r.user_id) || []);

            return {
              ...survey,
              question_count: questionCount || 0,
              response_count: uniqueUsers.size,
              creator_name: profilesMap[survey.creator_id] || '未知用户',
            };
          })
        );

        setSurveys(surveysWithStats);
      } catch (err) {
        console.error('加载问卷失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicSurveys();
  }, []);

  // 过滤问卷
  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (survey.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
   * 跳转到填写问卷页面
   */
  const handleFillSurvey = (survey: Survey) => {
    if (survey.is_private) {
      // 私密问卷，先弹出密码验证
      setSelectedSurvey(survey);
      setInputPassword('');
      setShowPasswordModal(true);
    } else {
      // 公开问卷，直接跳转
      router.push(`/fill-survey/${survey.id}`);
    }
  };

  /**
   * 验证密码并跳转
   */
  const handlePasswordVerify = async () => {
    if (!selectedSurvey) return;

    // 获取问卷的真实密码
    const { data: surveyData, error } = await supabase
      .from('surveys')
      .select('password')
      .eq('id', selectedSurvey.id)
      .single();

    if (error || !surveyData) {
      alert('验证失败，请重试！');
      return;
    }

    if (inputPassword === surveyData.password) {
      // 密码正确，跳转
      setShowPasswordModal(false);
      router.push(`/fill-survey/${selectedSurvey.id}`);
    } else {
      alert('密码错误！');
    }
  };

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

      {/* 加载状态 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">加载中...</p>
          </div>
        </div>
      ) : (
        <>
          {/* 问卷列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSurveys.length > 0 ? (
              filteredSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
                >
                  {/* 问卷标题 */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {survey.title}
                    </h3>
                    {survey.is_private && (
                      <span className="text-yellow-400 text-lg" title="私密问卷">
                        🔒
                      </span>
                    )}
                  </div>

                  {/* 问卷描述 */}
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {survey.is_private
                      ? '🔒 私密问卷，需要密码访问'
                      : (survey.description || '暂无描述')
                    }
                  </p>

                  {/* 问卷信息 */}
                  <div className="flex items-center gap-4 mb-4 text-white/50 text-sm flex-wrap">
                    <div className="flex items-center gap-1">
                      <span>👤</span>
                      <span>{survey.creator_name || '未知用户'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📝</span>
                      <span>{survey.question_count} 个问题</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📊</span>
                      <span>{survey.response_count} 人已填</span>
                    </div>
                  </div>

                  {/* 底部按钮 */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-white/40 text-xs">
                      {formatDate(survey.created_at)}
                    </span>
                    <button
                      onClick={() => handleFillSurvey(survey)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg text-sm font-medium"
                    >
                      开始填写 →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-white/60 text-lg">
                  {surveys.length === 0
                    ? '暂时没有公开问卷，快去创建第一个吧！'
                    : '没有找到相关问卷，试试其他关键词吧'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 密码验证弹窗 */}
      {showPasswordModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">🔒 私密问卷</h2>
            <p className="text-white/60 mb-4">
              问卷《{selectedSurvey.title}》需要密码访问
            </p>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="请输入密码..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerify()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
              >
                取消
              </button>
              <button
                onClick={handlePasswordVerify}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
