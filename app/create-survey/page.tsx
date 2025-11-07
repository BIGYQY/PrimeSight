"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function CreateSurveyPage() {
  const router = useRouter();

  // 题目列表
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      questionText: '',
      questionType: 'single_choice',
      options: ['选项 A', '选项 B'],
    },
  ]);

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

  const currentQuestion = questions[currentQuestionIndex];

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
   * 获取题型配置
   */
  const getTypeConfig = (type: QuestionType) => {
    return QUESTION_TYPES.find(t => t.id === type)!;
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* 左侧导航栏 */}
      <aside className="w-48 bg-slate-800 border-r border-white/10 flex flex-col">
        <div className="p-4 space-y-2">
          <button
            onClick={() => setShowAllQuestions(true)}
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <span>📋</span>
            <span className="font-medium">全部题目</span>
          </button>

          <button
            onClick={() => setShowTypeSelector(true)}
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <span>{getTypeConfig(currentQuestion.questionType).icon}</span>
            <span className="font-medium">题型</span>
          </button>
        </div>
      </aside>

      {/* 主编辑区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 进度条区域 */}
        <div className="bg-slate-800 border-b border-white/10 p-6">
          <div className="flex items-center justify-center gap-6">
            {/* 减号按钮 */}
            <button
              onClick={handleDeleteQuestion}
              className="w-10 h-10 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all border border-red-500/30 flex items-center justify-center font-bold text-xl"
              title="删除当前题目"
            >
              −
            </button>

            {/* 进度条 */}
            <div className="flex items-center gap-4">
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-white font-bold">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>

            {/* 加号按钮 */}
            <button
              onClick={handleAddQuestion}
              className="w-10 h-10 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-all border border-green-500/30 flex items-center justify-center font-bold text-xl"
              title="添加新题目"
            >
              +
            </button>
          </div>

          {/* 题目导航 */}
          <div className="flex justify-center gap-2 mt-4">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 题目编辑区域 */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            {/* 题型标签 */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-${getTypeConfig(currentQuestion.questionType).color}-600/20 text-${getTypeConfig(currentQuestion.questionType).color}-400 border border-${getTypeConfig(currentQuestion.questionType).color}-500/30`}>
                <span className="text-xl">{getTypeConfig(currentQuestion.questionType).icon}</span>
                <span className="font-medium">{getTypeConfig(currentQuestion.questionType).label}</span>
              </span>
            </div>

            {/* 题目输入框 */}
            <div className="mb-6">
              <label className="block text-white/80 mb-2 font-medium">题目：</label>
              <input
                type="text"
                value={currentQuestion.questionText}
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                placeholder="请输入题目内容..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 根据题型显示不同的选项编辑区域 */}
            {(currentQuestion.questionType === 'single_choice' || currentQuestion.questionType === 'multiple_choice' || currentQuestion.questionType === 'true_false') && (
              <div>
                <label className="block text-white/80 mb-2 font-medium">选项：</label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-white/60">
                        {currentQuestion.questionType === 'multiple_choice' ? '☑' : '○'}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {currentQuestion.questionType !== 'true_false' && (
                        <button
                          onClick={() => handleDeleteOption(index)}
                          className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
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
                    className="mt-3 px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all border border-green-500/30"
                  >
                    + 添加选项
                  </button>
                )}
              </div>
            )}

            {currentQuestion.questionType === 'rating' && (
              <div>
                <label className="block text-white/80 mb-2 font-medium">评分范围：</label>
                <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-white/60">用户可以给出 0 ~ 10 分的评分</p>
                  <div className="flex gap-2 mt-3">
                    {[...Array(11)].map((_, i) => (
                      <span key={i} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded text-white/60 text-sm">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.questionType === 'text' && (
              <div>
                <label className="block text-white/80 mb-2 font-medium">答案预览：</label>
                <textarea
                  placeholder="用户可以在这里输入长文本回答..."
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/40 h-32 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="bg-slate-800 border-t border-white/10 p-6 flex justify-end gap-4">
          <button
            onClick={() => {
              if (confirm('选择操作：\n确定 = 保存草稿\n取消 = 直接退出（不保存）')) {
                handleSaveAndExit();
              } else {
                handleExitWithoutSave();
              }
            }}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
          >
            保存或退出
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            发布问卷
          </button>
        </div>
      </main>

      {/* 全部题目弹窗 */}
      {showAllQuestions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAllQuestions(false)}>
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">全部题目</h2>
            <div className="space-y-3">
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
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-${typeConfig.color}-600/20 text-${typeConfig.color}-400`}>
                        {typeConfig.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          题目 {index + 1} - {typeConfig.label}
                        </p>
                        <p className="text-white/60 text-sm truncate">
                          {question.questionText || '（未设置题目）'}
                        </p>
                      </div>
                      <span className="text-blue-400">跳转</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowAllQuestions(false)}
              className="mt-6 w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 题型选择弹窗 */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTypeSelector(false)}>
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">选择题型</h2>
            <div className="space-y-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id as QuestionType)}
                  className={`w-full px-4 py-3 rounded-lg transition-all border ${
                    currentQuestion.questionType === type.id
                      ? `bg-${type.color}-600/20 border-${type.color}-500/50`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-white font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTypeSelector(false)}
              className="mt-6 w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 发布问卷弹窗 */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPublishModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">发布问卷</h2>

            {/* 问卷标题 */}
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">问卷标题 *</label>
              <input
                type="text"
                value={publishInfo.title}
                onChange={(e) => setPublishInfo({...publishInfo, title: e.target.value})}
                placeholder="请输入问卷标题..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 问卷描述 */}
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">问卷描述</label>
              <textarea
                value={publishInfo.description}
                onChange={(e) => setPublishInfo({...publishInfo, description: e.target.value})}
                placeholder="简单介绍一下这个问卷..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>

            {/* 发布类型 */}
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">发布类型</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPublishInfo({...publishInfo, isPrivate: false, password: ''})}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all border ${
                    !publishInfo.isPrivate
                      ? 'bg-green-600/20 border-green-500/50 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌍</div>
                    <div className="font-medium">公开</div>
                  </div>
                </button>
                <button
                  onClick={() => setPublishInfo({...publishInfo, isPrivate: true})}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all border ${
                    publishInfo.isPrivate
                      ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="font-medium">私密</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 私密问卷密码 */}
            {publishInfo.isPrivate && (
              <div className="mb-4">
                <label className="block text-white/80 mb-2 font-medium">访问密码 *</label>
                <input
                  type="text"
                  value={publishInfo.password}
                  onChange={(e) => setPublishInfo({...publishInfo, password: e.target.value})}
                  placeholder="设置访问密码..."
                  className="w-full px-4 py-3 bg-white/5 border border-yellow-500/30 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!publishInfo.title) {
                    alert('请输入问卷标题！');
                    return;
                  }
                  if (publishInfo.isPrivate && !publishInfo.password) {
                    alert('私密问卷需要设置访问密码！');
                    return;
                  }
                  // TODO: 提交到 Supabase
                  alert('发布成功！（功能开发中）');
                  router.push('/dashboard');
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                确认发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
