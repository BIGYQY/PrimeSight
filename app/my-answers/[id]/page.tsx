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
}

// 题目接口
interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: string[] | null;
  order: number;
}

// 我的回答接口
interface MyAnswer {
  question_id: string;
  answer: any;
  created_at: string;
}

export default function MyAnswersPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myAnswers, setMyAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMyAnswers = async () => {
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
          .select('id, title, description')
          .eq('id', surveyId)
          .single();

        if (surveyError || !surveyData) {
          alert('问卷不存在！');
          router.push('/dashboard');
          return;
        }

        setSurvey(surveyData);

        // 3. 获取所有题目
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

        // 4. 获取我的回答
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('question_id, answer, created_at')
          .eq('survey_id', surveyId)
          .eq('user_id', user.id);

        if (responsesError) {
          console.error('获取回答失败:', responsesError);
          alert('加载失败，请重试！');
          return;
        }

        // 构建答案映射
        const answersMap: Record<string, any> = {};
        (responsesData || []).forEach(response => {
          answersMap[response.question_id] = response.answer;
        });

        setMyAnswers(answersMap);
      } catch (err) {
        console.error('加载回答失败:', err);
        alert('加载失败，请重试！');
      } finally {
        setIsLoading(false);
      }
    };

    loadMyAnswers();
  }, [surveyId, router]);

  /**
   * 重新填写问卷
   */
  const handleRefill = () => {
    router.push(`/fill-survey/${surveyId}`);
  };

  /**
   * 渲染答案内容
   */
  const renderAnswer = (question: Question, answer: any) => {
    if (!answer) {
      return <p className="text-white/40 italic">未回答</p>;
    }

    switch (question.question_type) {
      case 'single_choice':
      case 'true_false':
        return (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-4 py-3 text-white">
            ✓ {answer}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {(answer as string[]).map((opt, index) => (
              <div key={index} className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-3 text-white">
                ✓ {opt}
              </div>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-6 py-4 text-center">
            <span className="text-3xl font-bold text-yellow-400">{answer}</span>
            <span className="text-white/60 ml-2">/ 10</span>
          </div>
        );

      case 'text':
        return (
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white whitespace-pre-wrap">
            {answer}
          </div>
        );

      default:
        return <p className="text-white">{String(answer)}</p>;
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* 顶部标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">我的回答</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
              >
                返回
              </button>
              <button
                onClick={handleRefill}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                🔄 重新填写
              </button>
            </div>
          </div>
          <h2 className="text-xl text-white/80 mb-2">{survey?.title}</h2>
          {survey?.description && (
            <p className="text-white/60">{survey.description}</p>
          )}
        </div>

        {/* 问题和答案列表 */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              {/* 题目 */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/50 text-sm">
                    {question.question_type === 'single_choice' && '单选题'}
                    {question.question_type === 'multiple_choice' && '多选题'}
                    {question.question_type === 'true_false' && '判断题'}
                    {question.question_type === 'rating' && '评分题'}
                    {question.question_type === 'text' && '填写题'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {index + 1}. {question.question_text}
                </h3>
              </div>

              {/* 答案 */}
              <div className="mt-4">
                <p className="text-white/60 text-sm mb-2">我的回答：</p>
                {renderAnswer(question, myAnswers[question.id])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
