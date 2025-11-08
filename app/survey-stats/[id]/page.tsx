"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// 题目类型定义
type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'rating' | 'text';

// 问卷接口
interface Survey {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  creator_email: string;
  created_at: string;
}

// 题目接口
interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: string[] | null;
  order: number;
}

// 回答接口
interface Response {
  user_id: string;
  user_email?: string;
  answer: any;
  created_at: string;
}

// 统计数据接口
interface QuestionStats {
  question: Question;
  totalResponses: number;
  stats: any;
}

export default function SurveyStatsPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 问卷和题目数据
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);

  // 当前题目索引
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 总填写人数
  const [totalUsers, setTotalUsers] = useState(0);

  // 用户ID到昵称的映射
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});

  const currentStats = questionStats[currentQuestionIndex];

  /**
   * 加载问卷和统计数据
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('请先登录！');
          router.push('/');
          return;
        }

        // 2. 获取问卷信息
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', surveyId)
          .single();

        if (surveyError || !surveyData) {
          alert('问卷不存在！');
          router.push('/dashboard');
          return;
        }

        // 3. 权限验证 - 只有创建者能查看统计
        if (user.id !== surveyData.creator_id) {
          alert('你没有权限查看这个问卷的统计！');
          router.push('/dashboard');
          return;
        }

        setSurvey(surveyData);

        // 4. 获取所有题目
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('survey_id', surveyId)
          .order('order', { ascending: true });

        if (questionsError) {
          console.error('获取题目失败:', questionsError);
          alert('加载失败，请重试！');
          return;
        }

        setQuestions(questionsData || []);

        // 5. 获取所有回答
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('*')
          .eq('survey_id', surveyId)
          .order('created_at', { ascending: false });

        if (responsesError) {
          console.error('获取回答失败:', responsesError);
          alert('加载失败，请重试！');
          return;
        }

        // 6. 计算总填写人数（去重）
        const uniqueUsers = new Set(responsesData?.map(r => r.user_id) || []);
        setTotalUsers(uniqueUsers.size);

        // 7. 批量获取所有填写者的 profiles
        const userIds = Array.from(uniqueUsers);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('获取 profiles 失败:', profilesError);
        }

        // 创建 userId -> displayName 的映射
        const profilesMap: Record<string, string> = {};
        (profilesData || []).forEach(profile => {
          profilesMap[profile.user_id] = profile.display_name;
        });
        setUserProfiles(profilesMap);

        // 8. 计算每道题的统计数据
        const stats = (questionsData || []).map(question => {
          const questionResponses = responsesData?.filter(r => r.question_id === question.id) || [];
          return calculateQuestionStats(question, questionResponses, profilesMap);
        });

        setQuestionStats(stats);
      } catch (err) {
        console.error('加载统计数据失败:', err);
        alert('加载失败，请重试！');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [surveyId, router]);

  /**
   * 计算单道题的统计数据
   */
  const calculateQuestionStats = (
    question: Question,
    responses: Response[],
    profilesMap: Record<string, string>
  ): QuestionStats => {
    const totalResponses = responses.length;

    if (question.question_type === 'single_choice' || question.question_type === 'true_false') {
      // 单选题/判断题统计
      const optionCounts: Record<string, number> = {};
      (question.options || []).forEach(option => {
        optionCounts[option] = 0;
      });

      responses.forEach(response => {
        const answer = response.answer;
        if (answer && optionCounts.hasOwnProperty(answer)) {
          optionCounts[answer]++;
        }
      });

      return {
        question,
        totalResponses,
        stats: optionCounts,
      };
    } else if (question.question_type === 'multiple_choice') {
      // 多选题统计
      const optionCounts: Record<string, number> = {};
      (question.options || []).forEach(option => {
        optionCounts[option] = 0;
      });

      responses.forEach(response => {
        const answers = response.answer || [];
        answers.forEach((answer: string) => {
          if (optionCounts.hasOwnProperty(answer)) {
            optionCounts[answer]++;
          }
        });
      });

      return {
        question,
        totalResponses,
        stats: optionCounts,
      };
    } else if (question.question_type === 'rating') {
      // 评分题统计
      const ratingCounts: Record<number, number> = {};
      for (let i = 0; i <= 10; i++) {
        ratingCounts[i] = 0;
      }

      let sum = 0;
      responses.forEach(response => {
        const rating = response.answer;
        if (typeof rating === 'number' && rating >= 0 && rating <= 10) {
          ratingCounts[rating]++;
          sum += rating;
        }
      });

      const average = totalResponses > 0 ? (sum / totalResponses).toFixed(1) : '0';

      return {
        question,
        totalResponses,
        stats: {
          ratingCounts,
          average,
        },
      };
    } else {
      // 文本题统计
      const textAnswers = responses.map(response => ({
        user_id: response.user_id,
        user_name: profilesMap[response.user_id] || response.user_email || '未知用户',
        answer: response.answer || '',
        created_at: response.created_at,
      }));

      return {
        question,
        totalResponses,
        stats: textAnswers,
      };
    }
  };

  /**
   * 上一题
   */
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  /**
   * 下一题
   */
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
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

  // 加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">加载统计数据中...</p>
        </div>
      </div>
    );
  }

  // 没有题目
  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-white mb-3">问卷为空</h2>
          <p className="text-white/60 mb-6">这个问卷还没有题目</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部问卷标题区域 */}
        <div className="p-6 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">📊 {survey?.title}</h1>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all text-sm"
              >
                返回
              </button>
            </div>
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <span>📅 发布于 {formatDate(survey?.created_at || '')}</span>
              <span>👥 {totalUsers} 人填写</span>
            </div>
          </div>
        </div>

        {/* 进度条区域 */}
        <div className="px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-white/50 text-sm">
                第 {currentQuestionIndex + 1} / 共 {questions.length} 题
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-1.5">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-lg transition-all text-sm font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 统计内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-5">
            {currentStats && (
              <>
                {/* 题目文本 */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white/50 text-sm">
                      {currentStats.question.question_type === 'single_choice' && '单选题'}
                      {currentStats.question.question_type === 'multiple_choice' && '多选题'}
                      {currentStats.question.question_type === 'true_false' && '判断题'}
                      {currentStats.question.question_type === 'rating' && '评分题'}
                      {currentStats.question.question_type === 'text' && '填写题'}
                    </span>
                    <span className="text-white/50 text-sm">
                      👥 {currentStats.totalResponses} 人回答
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {currentQuestionIndex + 1}. {currentStats.question.question_text}
                  </h2>
                </div>

                {/* 根据题型显示不同的统计结果 */}
                {(currentStats.question.question_type === 'single_choice' ||
                  currentStats.question.question_type === 'true_false' ||
                  currentStats.question.question_type === 'multiple_choice') && (
                  <div className="space-y-3">
                    {(currentStats.question.options || []).map((option, index) => {
                      const count = currentStats.stats[option] || 0;
                      const percentage = currentStats.totalResponses > 0
                        ? Math.round((count / currentStats.totalResponses) * 100)
                        : 0;

                      return (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-white/40 text-lg">
                                {currentStats.question.question_type === 'multiple_choice' ? '☑' : '○'}
                              </span>
                              <span className="text-white font-medium">{option}</span>
                            </div>
                            <span className="text-white/60 text-sm">
                              👥 {count} 人 ({percentage}%)
                            </span>
                          </div>
                          {/* 进度条 */}
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentStats.question.question_type === 'rating' && (
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="text-center mb-6">
                      <p className="text-white/60 text-sm mb-2">平均分</p>
                      <p className="text-5xl font-bold text-yellow-400">
                        {currentStats.stats.average}
                        <span className="text-2xl text-white/40"> / 10</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(score => {
                        const count = currentStats.stats.ratingCounts[score] || 0;
                        const maxCount = Math.max(...Object.values(currentStats.stats.ratingCounts));
                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                          <div key={score} className="flex items-center gap-3">
                            <span className="text-white/60 text-sm w-8">{score}分</span>
                            <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                              <span className="absolute inset-0 flex items-center justify-start pl-3 text-white text-xs font-medium">
                                {count > 0 && `${count} 人`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStats.question.question_type === 'text' && (
                  <div className="space-y-3">
                    <p className="text-white/60 text-sm">
                      📝 收到 {currentStats.stats.length} 条回答
                    </p>
                    {currentStats.stats.slice(0, 10).map((item: any, index: number) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-sm text-white/50">
                          <span>👤 {item.user_name}</span>
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                        <p className="text-white">{item.answer || '（未填写）'}</p>
                      </div>
                    ))}
                    {currentStats.stats.length > 10 && (
                      <button className="w-full px-4 py-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-all text-sm">
                        展开查看全部 {currentStats.stats.length} 条回答 ▼
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 上一题
            </button>

            <button
              onClick={handleNext}
              disabled={currentQuestionIndex >= questions.length - 1}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一题 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
