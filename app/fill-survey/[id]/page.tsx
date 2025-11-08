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
  is_private: boolean;
  password: string | null;
  creator_id: string;
}

// 题目接口
interface Question {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: QuestionType;
  options: string[] | null;
  order: number;
}

// 答案接口
interface Answer {
  question_id: string;
  answer: any;
}

export default function FillSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  // 问卷和题目数据
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当前题目索引
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 用户答案（question_id -> answer）
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // 密码验证
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * 加载问卷和题目数据
   */
  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        // 1. 获取问卷信息
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

        setSurvey(surveyData);

        // 2. 如果是私密问卷，显示密码验证弹窗
        if (surveyData.is_private) {
          setShowPasswordModal(true);
          setIsLoading(false);
          return;
        }

        // 3. 获取所有题目（按顺序）
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
        setIsPasswordVerified(true);
      } catch (err) {
        console.error('加载问卷失败:', err);
        alert('加载失败，请重试！');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [surveyId, router]);

  /**
   * 验证密码
   */
  const handlePasswordVerify = async () => {
    if (!survey) return;

    if (inputPassword === survey.password) {
      // 密码正确，加载题目
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
      setIsPasswordVerified(true);
      setShowPasswordModal(false);
    } else {
      alert('密码错误！');
    }
  };

  /**
   * 更新答案
   */
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
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
   * 提交答案
   */
  const handleSubmit = async () => {
    // 检查是否所有题目都已回答
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      alert(`还有 ${unansweredQuestions.length} 道题未回答！`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录！');
        setIsSubmitting(false);
        return;
      }

      // 构建要插入的数据
      const responsesToInsert = questions.map(question => ({
        survey_id: surveyId,
        question_id: question.id,
        user_id: user.id,
        answer: answers[question.id],
      }));

      // 批量插入到 responses 表
      const { error } = await supabase
        .from('responses')
        .insert(responsesToInsert);

      if (error) {
        console.error('提交失败:', error);
        alert(`提交失败：${error.message}`);
        setIsSubmitting(false);
        return;
      }

      alert('🎉 提交成功！感谢你的参与！');
      router.push('/dashboard');
    } catch (err) {
      console.error('提交过程出错:', err);
      alert('提交失败，请重试！');
      setIsSubmitting(false);
    }
  };

  // 加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">加载中...</p>
        </div>
      </div>
    );
  }

  // 密码验证弹窗
  if (showPasswordModal && !isPasswordVerified) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">🔒 私密问卷</h2>
          <p className="text-white/60 mb-4">这是一个私密问卷，请输入访问密码：</p>
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
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              返回
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
            <h1 className="text-3xl font-bold text-white mb-2">{survey?.title}</h1>
            {survey?.description && (
              <p className="text-white/60">{survey.description}</p>
            )}
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
          </div>
        </div>

        {/* 题目区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* 题目文本 */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentQuestionIndex + 1}. {currentQuestion.question_text}
              </h2>
            </div>

            {/* 根据题型显示不同的答题区域 */}
            {(currentQuestion.question_type === 'single_choice' || currentQuestion.question_type === 'true_false') && (
              <div className="space-y-3">
                {(currentQuestion.options || []).map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerChange(currentQuestion.id, option)}
                    className={`w-full text-left px-6 py-4 rounded-lg transition-all border ${
                      answers[currentQuestion.id] === option
                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-white/30'
                      }`}>
                        {answers[currentQuestion.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-lg">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'multiple_choice' && (
              <div className="space-y-3">
                {(currentQuestion.options || []).map((option, index) => {
                  const selectedOptions = answers[currentQuestion.id] || [];
                  const isSelected = selectedOptions.includes(option);

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        const currentAnswers = answers[currentQuestion.id] || [];
                        const newAnswers = isSelected
                          ? currentAnswers.filter((a: string) => a !== option)
                          : [...currentAnswers, option];
                        handleAnswerChange(currentQuestion.id, newAnswers);
                      }}
                      className={`w-full text-left px-6 py-4 rounded-lg transition-all border ${
                        isSelected
                          ? 'bg-green-500/20 border-green-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-green-500 bg-green-500'
                            : 'border-white/30'
                        }`}>
                          {isSelected && (
                            <span className="text-white text-sm">✓</span>
                          )}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.question_type === 'rating' && (
              <div className="bg-white/5 rounded-lg p-6">
                <p className="text-white/60 text-sm mb-4 text-center">请给出 0 ~ 10 分的评分</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[...Array(11)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerChange(currentQuestion.id, i)}
                      className={`w-12 h-12 rounded-lg transition-all text-lg font-medium ${
                        answers[currentQuestion.id] === i
                          ? 'bg-yellow-500 text-white scale-110'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.question_type === 'text' && (
              <div>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="请输入你的答案..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all h-40 resize-none"
                />
              </div>
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

            <div className="flex gap-3">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold"
                >
                  下一题 →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      提交中...
                    </>
                  ) : (
                    '🎉 提交答案'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
