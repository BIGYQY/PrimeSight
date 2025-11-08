"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// 题目类型定义
type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'rating' | 'text';

// 题目接口
interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: string[]; // 选项数组（选择题、判断题用）
}

// 题型配置
const QUESTION_TYPES = [
  { id: 'single_choice', label: '单选题', icon: '🔘', color: 'blue' },
  { id: 'multiple_choice', label: '多选题', icon: '☑️', color: 'green' },
  { id: 'true_false', label: '判断题', icon: '⚖️', color: 'yellow' },
  { id: 'rating', label: '评分题', icon: '⭐', color: 'red' },
  { id: 'text', label: '填写题', icon: '📝', color: 'purple' },
];

export default function EditSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 题目列表
  const [questions, setQuestions] = useState<Question[]>([]);

  // 当前编辑的题目索引
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 是否显示全部题目弹窗
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // 是否显示题型选择弹窗
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // 是否显示发布弹窗
  const [showPublishModal, setShowPublishModal] = useState(false);

  // 发布信息
  const [publishInfo, setPublishInfo] = useState({
    title: '',
    description: '',
    isPrivate: false,
    password: '',
  });

  // 发布中状态
  const [isPublishing, setIsPublishing] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * 加载问卷数据
   */
  useEffect(() => {
    const loadSurveyData = async () => {
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

        // 检查是否是创建者
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id !== surveyData.creator_id) {
          alert('你没有权限编辑这个问卷！');
          router.push('/dashboard');
          return;
        }

        // 设置问卷信息
        setPublishInfo({
          title: surveyData.title,
          description: surveyData.description || '',
          isPrivate: surveyData.is_private,
          password: surveyData.password || '',
        });

        // 2. 获取所有题目
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

        // 转换题目格式
        const loadedQuestions = (questionsData || []).map((q) => ({
          id: q.id,
          questionText: q.question_text,
          questionType: q.question_type as QuestionType,
          options: q.options || [],
        }));

        setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [
          {
            id: '1',
            questionText: '',
            questionType: 'single_choice',
            options: ['选项 A', '选项 B'],
          },
        ]);
      } catch (err) {
        console.error('加载问卷失败:', err);
        alert('加载失败，请重试！');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveyData();
  }, [surveyId, router]);

  /**
   * 添加题目
   */
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: '',
      questionType: 'single_choice',
      options: ['选项 A', '选项 B'],
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  /**
   * 删除当前题目
   */
  const handleDeleteQuestion = () => {
    if (questions.length === 1) {
      alert('至少要保留一个题目！');
      return;
    }
    const newQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  /**
   * 更新题目文本
   */
  const handleQuestionTextChange = (text: string) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].questionText = text;
    setQuestions(newQuestions);
  };

  /**
   * 切换题型
   */
  const handleTypeChange = (newType: QuestionType) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].questionType = newType;

    // 根据题型设置默认选项
    if (newType === 'single_choice' || newType === 'multiple_choice') {
      newQuestions[currentQuestionIndex].options = ['选项 A', '选项 B'];
    } else if (newType === 'true_false') {
      newQuestions[currentQuestionIndex].options = ['正确', '错误'];
    } else {
      newQuestions[currentQuestionIndex].options = [];
    }

    setQuestions(newQuestions);
    setShowTypeSelector(false);
  };

  /**
   * 添加选项
   */
  const handleAddOption = () => {
    const newQuestions = [...questions];
    const optionLabel = String.fromCharCode(65 + currentQuestion.options.length); // A, B, C...
    newQuestions[currentQuestionIndex].options.push(`选项 ${optionLabel}`);
    setQuestions(newQuestions);
  };

  /**
   * 删除选项
   */
  const handleDeleteOption = (optionIndex: number) => {
    if (currentQuestion.options.length <= 2) {
      alert('至少要保留两个选项！');
      return;
    }
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].options = currentQuestion.options.filter(
      (_, index) => index !== optionIndex
    );
    setQuestions(newQuestions);
  };

  /**
   * 更新选项文本
   */
  const handleOptionChange = (optionIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].options[optionIndex] = text;
    setQuestions(newQuestions);
  };

  /**
   * 保存并退出
   */
  const handleSaveAndExit = () => {
    if (confirm('是否保存草稿并退出？')) {
      // TODO: 保存到本地存储或数据库
      router.push('/dashboard');
    }
  };

  /**
   * 直接退出（不保存）
   */
  const handleExitWithoutSave = () => {
    if (confirm('确定不保存直接退出吗？所有更改将丢失！')) {
      router.push('/dashboard');
    }
  };

  /**
   * 更新问卷到 Supabase
   */
  const handlePublish = async () => {
    // 验证必填项
    if (!publishInfo.title) {
      alert('请输入问卷标题！');
      return;
    }
    if (publishInfo.isPrivate && !publishInfo.password) {
      alert('私密问卷需要设置访问密码！');
      return;
    }

    // 验证至少有一个题目且题目内容不为空
    if (questions.length === 0) {
      alert('至少需要一个题目才能保存！');
      return;
    }
    const hasEmptyQuestion = questions.some(q => !q.questionText.trim());
    if (hasEmptyQuestion) {
      alert('请填写所有题目的内容！');
      return;
    }

    setIsPublishing(true);

    try {
      // 1. 更新问卷信息
      const { error: surveyError } = await supabase
        .from('surveys')
        .update({
          title: publishInfo.title,
          description: publishInfo.description,
          is_private: publishInfo.isPrivate,
          password: publishInfo.isPrivate ? publishInfo.password : null,
        })
        .eq('id', surveyId);

      if (surveyError) {
        console.error('更新问卷失败:', surveyError);
        alert(`保存失败：${surveyError.message}`);
        setIsPublishing(false);
        return;
      }

      // 2. 删除旧的题目
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('survey_id', surveyId);

      if (deleteError) {
        console.error('删除旧题目失败:', deleteError);
        alert(`保存失败：${deleteError.message}`);
        setIsPublishing(false);
        return;
      }

      // 3. 插入新题目
      const questionsToInsert = questions.map((question, index) => ({
        survey_id: surveyId,
        question_text: question.questionText,
        question_type: question.questionType,
        options: question.options.length > 0 ? question.options : null,
        order: index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('保存题目失败:', questionsError);
        alert(`保存失败：${questionsError.message}`);
        setIsPublishing(false);
        return;
      }

      // 4. 保存成功
      alert('✅ 问卷已更新！');
      router.push('/dashboard');
    } catch (err) {
      console.error('更新过程出错:', err);
      alert('保存失败，请重试！');
      setIsPublishing(false);
    }
  };

  /**
   * 获取题型配置
   */
  const getTypeConfig = (type: QuestionType) => {
    return QUESTION_TYPES.find(t => t.id === type)!;
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

  return (
    <div className="flex h-screen bg-slate-900">
      {/* 主编辑区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部进度条区域 - 统一背景无边框 */}
        <div className="px-6 py-4">
          <div className="flex flex-col gap-3 max-w-5xl mx-auto">
            {/* 第一行：进度条（占满） */}
            <div className="flex items-center gap-4">
              {/* 减号按钮 */}
              <button
                onClick={handleDeleteQuestion}
                className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xl font-bold flex-shrink-0"
                title="删除当前题目"
              >
                −
              </button>

              {/* 进度条 - 点击弹出全部题目 */}
              <button
                onClick={() => setShowAllQuestions(true)}
                className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                title="点击查看全部题目"
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </button>

              {/* 加号按钮 */}
              <button
                onClick={handleAddQuestion}
                className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all text-xl font-bold flex-shrink-0"
                title="添加新题目"
              >
                +
              </button>
            </div>

            {/* 第二行：题目导航 + 进度提示 */}
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
              <span className="text-white/50 text-sm">
                第 {currentQuestionIndex + 1} / 共 {questions.length} 题
              </span>
            </div>
          </div>
        </div>

        {/* 题目编辑区域 - 紧凑统一版 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* 题型标签 - 紧凑版 */}
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">题型</span>
              <button
                onClick={() => setShowTypeSelector(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  getTypeConfig(currentQuestion.questionType).color === 'blue' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                  getTypeConfig(currentQuestion.questionType).color === 'green' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                  getTypeConfig(currentQuestion.questionType).color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' :
                  getTypeConfig(currentQuestion.questionType).color === 'red' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                  'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                }`}
              >
                <span className="text-lg">{getTypeConfig(currentQuestion.questionType).icon}</span>
                <span className="font-medium">{getTypeConfig(currentQuestion.questionType).label}</span>
                <span className="text-xs">▼</span>
              </button>
            </div>

            {/* 题目输入框 */}
            <div>
              <label className="block text-white/70 mb-2 text-sm font-medium">题目内容</label>
              <input
                type="text"
                value={currentQuestion.questionText}
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                placeholder="请输入题目内容..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            {/* 根据题型显示不同的选项编辑区域 */}
            {(currentQuestion.questionType === 'single_choice' || currentQuestion.questionType === 'multiple_choice' || currentQuestion.questionType === 'true_false') && (
              <div>
                <label className="block text-white/70 mb-2 text-sm font-medium">选项</label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="group flex items-center gap-3">
                      <span className="text-white/40 text-lg flex-shrink-0">
                        {currentQuestion.questionType === 'multiple_choice' ? '☑' : '○'}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                      />
                      {currentQuestion.questionType !== 'true_false' && (
                        <button
                          onClick={() => handleDeleteOption(index)}
                          className="opacity-0 group-hover:opacity-100 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {currentQuestion.questionType !== 'true_false' && (
                  <button
                    onClick={handleAddOption}
                    className="mt-3 w-full px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all text-sm font-medium"
                  >
                    + 添加选项
                  </button>
                )}
              </div>
            )}

            {currentQuestion.questionType === 'rating' && (
              <div>
                <label className="block text-white/70 mb-2 text-sm font-medium">评分范围</label>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-3 text-center">用户可以给出 <span className="text-yellow-400 font-bold">0 ~ 10</span> 分的评分</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {[...Array(11)].map((_, i) => (
                      <div key={i} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white/70 text-sm font-medium">
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.questionType === 'text' && (
              <div>
                <label className="block text-white/70 mb-2 text-sm font-medium">答案预览</label>
                <textarea
                  placeholder="用户可以在这里输入长文本回答..."
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/30 h-32 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 - 保存和更新按钮 */}
        <div className="p-4 flex justify-end gap-3">
          <button
            onClick={handleSaveAndExit}
            className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all font-semibold border border-white/10"
          >
            💾 保存或退出
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg"
          >
            ✅ 保存问卷
          </button>
        </div>
      </main>

      {/* 全部题目弹窗 - 紧凑版 */}
      {showAllQuestions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAllQuestions(false)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">全部题目</h2>
            <div className="space-y-2">
              {questions.map((question, index) => {
                const typeConfig = getTypeConfig(question.questionType);
                return (
                  <button
                    key={question.id}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setShowAllQuestions(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                        typeConfig.color === 'blue' ? 'bg-blue-500/20' :
                        typeConfig.color === 'green' ? 'bg-green-500/20' :
                        typeConfig.color === 'yellow' ? 'bg-yellow-500/20' :
                        typeConfig.color === 'red' ? 'bg-red-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        {typeConfig.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          题目 {index + 1} - {typeConfig.label}
                        </p>
                        <p className="text-white/50 text-xs truncate">
                          {question.questionText || '（未设置题目内容）'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowAllQuestions(false)}
              className="mt-4 w-full px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 题型选择弹窗 - 紧凑版 */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTypeSelector(false)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">选择题型</h2>
            <div className="space-y-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id as QuestionType)}
                  className={`w-full px-4 py-3 rounded-lg transition-all border ${
                    currentQuestion.questionType === type.id
                      ? `${
                          type.color === 'blue' ? 'bg-blue-500/20 border-blue-500/50' :
                          type.color === 'green' ? 'bg-green-500/20 border-green-500/50' :
                          type.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/50' :
                          type.color === 'red' ? 'bg-red-500/20 border-red-500/50' :
                          'bg-purple-500/20 border-purple-500/50'
                        }`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-white font-medium text-sm">{type.label}</span>
                    {currentQuestion.questionType === type.id && (
                      <span className="ml-auto text-white">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTypeSelector(false)}
              className="mt-4 w-full px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 保存问卷弹窗 - 紧凑版 */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPublishModal(false)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">保存问卷</h2>

            {/* 问卷标题 */}
            <div className="mb-4">
              <label className="block text-white/70 mb-2 text-sm font-medium">问卷标题 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={publishInfo.title}
                onChange={(e) => setPublishInfo({...publishInfo, title: e.target.value})}
                placeholder="请输入问卷标题..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            {/* 问卷描述 */}
            <div className="mb-4">
              <label className="block text-white/70 mb-2 text-sm font-medium">问卷描述</label>
              <textarea
                value={publishInfo.description}
                onChange={(e) => setPublishInfo({...publishInfo, description: e.target.value})}
                placeholder="简单介绍一下这个问卷..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all h-20 resize-none"
              />
            </div>

            {/* 发布类型 */}
            <div className="mb-4">
              <label className="block text-white/70 mb-2 text-sm font-medium">发布类型</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPublishInfo({...publishInfo, isPrivate: false, password: ''})}
                  className={`px-4 py-3 rounded-lg transition-all border ${
                    !publishInfo.isPrivate
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌍</div>
                    <div className="font-medium text-sm text-white">公开</div>
                  </div>
                </button>
                <button
                  onClick={() => setPublishInfo({...publishInfo, isPrivate: true})}
                  className={`px-4 py-3 rounded-lg transition-all border ${
                    publishInfo.isPrivate
                      ? 'bg-yellow-500/20 border-yellow-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="font-medium text-sm text-white">私密</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 私密问卷密码 */}
            {publishInfo.isPrivate && (
              <div className="mb-4">
                <label className="block text-white/70 mb-2 text-sm font-medium">访问密码 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={publishInfo.password}
                  onChange={(e) => setPublishInfo({...publishInfo, password: e.target.value})}
                  placeholder="设置访问密码..."
                  className="w-full px-4 py-2 bg-white/5 border border-yellow-500/50 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-500 focus:bg-white/10 transition-all"
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowPublishModal(false)}
                disabled={isPublishing}
                className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    保存中...
                  </>
                ) : (
                  '确认保存'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
