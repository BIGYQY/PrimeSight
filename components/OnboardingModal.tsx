"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EyeLogo from "@/components/EyeLogo";
import { supabase } from "@/lib/supabase/client"; // 导入 Supabase 客户端

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();

  // 当前步骤（1-5）
  const [currentStep, setCurrentStep] = useState(1);
  // 用户选择（登录 or 注册）
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  // 表单数据
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 加载状态（登录/注册时显示加载动画）
  const [isLoading, setIsLoading] = useState(false);
  // 错误信息（如果登录/注册失败）
  const [error, setError] = useState("");

  // 总步骤数（合并邮箱密码步骤）
  const totalSteps = 5;

  // 下一步
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * 处理 Enter 键提交
   */
  const handleKeyPress = (e: React.KeyboardEvent, currentField: 'email' | 'password') => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (currentField === 'email') {
        // 在邮箱输入框按 Enter，聚焦到密码框
        const passwordInput = document.getElementById('password-input') as HTMLInputElement;
        if (passwordInput) {
          passwordInput.focus();
        }
      } else if (currentField === 'password') {
        // 在密码输入框按 Enter，提交表单
        if (validateEmail(email) && password.length >= 6) {
          handleAuth();
        }
      }
    }
  };

  /**
   * 翻译 Supabase 错误信息为中文
   */
  const translateError = (error: string): string => {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': '邮箱或密码错误，请检查后重试',
      'Email not confirmed': '邮箱还未确认，请先去邮箱点击确认链接',
      'User already registered': '该邮箱已被注册，请直接登录',
      'Invalid email': '邮箱格式不正确，请输入有效的邮箱地址',
      'Password should be at least 6 characters': '密码至少需要6个字符',
      'Unable to validate email address: invalid format': '邮箱格式不正确',
      'Email rate limit exceeded': '发送邮件过于频繁，请稍后再试',
      'Signups not allowed for this instance': '当前不允许注册新用户',
    };

    // 查找匹配的错误信息
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.includes(key)) {
        return value;
      }
    }

    // 如果没有匹配的，返回原始错误
    return `发生错误：${error}`;
  };

  /**
   * 验证邮箱格式
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 处理登录或注册
   * 这个函数会调用 Supabase 的真实 API
   */
  const handleAuth = async () => {
    // 清空之前的错误信息
    setError("");

    // 前端验证邮箱格式
    if (!validateEmail(email)) {
      setError("邮箱格式不正确，请输入有效的邮箱地址（如：example@gmail.com）");
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }

    // 开始加载
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        // 注册新用户
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) {
          // 注册失败，显示翻译后的错误
          setError(translateError(error.message));
          console.error("注册错误:", error);
        } else {
          console.log("注册返回数据:", data);

          // 如果注册成功且有用户数据，创建 profile
          if (data.user) {
            // 从邮箱提取默认昵称（邮箱 @ 前面的部分）
            const defaultDisplayName = email.split('@')[0];

            // 创建用户 profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: data.user.id,
                display_name: defaultDisplayName,
              });

            if (profileError) {
              console.error('创建 profile 失败:', profileError);
              // 不影响注册流程，只记录错误
            } else {
              console.log('Profile 创建成功:', defaultDisplayName);
            }
          }

          // 关键：检查是否需要邮箱确认
          if (data.session === null) {
            // session 为 null，说明需要邮箱确认
            // 跳转到"等待邮箱确认"页面（步骤4）
            setCurrentStep(4);
          } else {
            // session 不为 null，说明注册并自动登录成功
            // 跳转到"注册成功"页面（步骤5）
            setCurrentStep(5);
          }
        }
      } else {
        // 登录已有用户
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          // 登录失败，显示翻译后的错误
          setError(translateError(error.message));
          console.error("登录错误:", error);
        } else {
          // 登录成功！进入最后一步（步骤5）
          console.log("登录成功:", data);
          setCurrentStep(5);
        }
      }
    } catch (err) {
      // 捕获其他异常错误
      setError("发生了未知错误，请稍后重试");
      console.error("认证异常:", err);
    } finally {
      // 无论成功失败，都关闭加载状态
      setIsLoading(false);
    }
  };

  // 重置状态
  const resetModal = () => {
    setCurrentStep(1);
    setAuthMode(null);
    setEmail("");
    setPassword("");
    setError(""); // 也要清空错误信息
    setIsLoading(false); // 重置加载状态
  };

  // 关闭并重置
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 完成引导，跳转到 dashboard
  const handleFinish = () => {
    resetModal();
    onClose();
    router.push('/dashboard'); // 跳转到真正的主页
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* 引导内容 - 长方形，更大更像谷歌登录 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl max-w-3xl w-full pointer-events-auto animate-slide-up border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onKeyPress={(e) => {
            // 在步骤1（欢迎界面）和步骤5（完成界面）按 Enter 继续
            if (e.key === 'Enter') {
              if (currentStep === 1) {
                nextStep();
              } else if (currentStep === 5) {
                handleFinish();
              }
            }
          }}
          tabIndex={0} // 让 div 可以接收键盘事件
        >
          {/* 顶部进度条 */}
          <div className="h-2 bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* 内容区域 - 更高的长方形 */}
          <div className="p-8 min-h-[500px] flex flex-col">
            {/* 步骤 1：欢迎界面 */}
            {currentStep === 1 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="scale-75">
                    <EyeLogo />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">👋</div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    欢迎来到 PrimeSight！
                  </h2>
                  <p className="text-white/70 text-lg">
                    开始你的问卷调查之旅
                  </p>
                </div>

                <div className="space-y-3 text-white/60 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <span>创建精美的问卷</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <span>实时查看统计数据</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <span>提升沟通效率</span>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                >
                  开始 →
                </button>
              </div>
            )}

            {/* 步骤 2：选择登录/注册 */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="scale-75">
                    <EyeLogo />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  选择操作
                </h2>
                <p className="text-white/60 text-center mb-8">
                  你想要登录还是注册新账号？
                </p>

                <div className="space-y-4 mb-8">
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      nextStep();
                    }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium text-lg"
                  >
                    📝 注册新账号
                  </button>

                  <button
                    onClick={() => {
                      setAuthMode('login');
                      nextStep();
                    }}
                    className="w-full py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium text-lg"
                  >
                    🔐 已有账号，登录
                  </button>
                </div>

                <button
                  onClick={prevStep}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  ← 返回
                </button>
              </div>
            )}

            {/* 步骤 3：输入邮箱和密码（合并） */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="scale-75">
                    <EyeLogo />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  {authMode === 'signup' ? '创建账号' : '欢迎回来'}
                </h2>
                <p className="text-white/60 text-center mb-8">
                  请输入你的邮箱和密码
                </p>

                {/* 错误提示 */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm text-center">❌ {error}</p>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {/* 邮箱输入框 */}
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">
                      邮箱地址
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'email')}
                      placeholder="example@gmail.com"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all ${
                        email && !validateEmail(email)
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-white/30 focus:ring-blue-500'
                      }`}
                      autoFocus
                    />
                    {/* 邮箱格式错误提示 */}
                    {email && !validateEmail(email) && (
                      <p className="text-red-400 text-xs mt-2">
                        ⚠️ 邮箱格式不正确，请输入有效的邮箱地址
                      </p>
                    )}
                    {/* 邮箱格式正确提示 */}
                    {email && validateEmail(email) && (
                      <p className="text-green-400 text-xs mt-2">
                        ✓ 邮箱格式正确
                      </p>
                    )}
                  </div>

                  {/* 密码输入框 */}
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">
                      密码
                    </label>
                    <input
                      id="password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'password')}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all ${
                        password && password.length < 6
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-white/30 focus:ring-blue-500'
                      }`}
                    />
                    {/* 密码长度不足提示 */}
                    {password && password.length < 6 && (
                      <p className="text-red-400 text-xs mt-2">
                        ⚠️ 密码至少需要6个字符
                      </p>
                    )}
                    {/* 密码长度符合要求 */}
                    {password && password.length >= 6 && (
                      <p className="text-green-400 text-xs mt-2">
                        ✓ 密码格式正确
                      </p>
                    )}
                    {authMode === 'signup' && !password && (
                      <p className="text-white/40 text-xs mt-2">
                        密码至少 6 位字符
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                    disabled={isLoading}
                  >
                    ← 返回
                  </button>
                  <button
                    onClick={handleAuth}
                    disabled={!validateEmail(email) || password.length < 6 || isLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      // 加载时显示加载动画
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{authMode === 'signup' ? '注册中...' : '登录中...'}</span>
                      </>
                    ) : (
                      // 正常显示按钮文字
                      <span>{authMode === 'signup' ? '创建账号' : '登录'} →</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 步骤 4：等待邮箱确认 */}
            {currentStep === 4 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                <div className="text-center">
                  {/* Logo */}
                  <div className="flex justify-center mb-4">
                    <div className="scale-90">
                      <EyeLogo />
                    </div>
                  </div>

                  <div className="text-7xl mb-6">📧</div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    请确认你的邮箱
                  </h2>
                  <p className="text-white/70 text-lg mb-8">
                    我们已经发送了一封确认邮件到：
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10">
                    <p className="text-white font-semibold text-lg">{email}</p>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-6">
                    <p className="text-blue-200 text-sm leading-relaxed">
                      📬 请打开你的邮箱，点击确认链接<br/>
                      ⏱️ 邮件可能需要几分钟才能送达<br/>
                      📂 如果没收到，请检查垃圾邮件文件夹
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        // 直接跳转到步骤3（登录界面）
                        setAuthMode('login');
                        setCurrentStep(3); // 直接到输入邮箱密码的界面
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                    >
                      ✅ 我已确认邮箱，去登录 →
                    </button>

                    <button
                      onClick={handleClose}
                      className="w-full py-3 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-300 font-medium"
                    >
                      稍后登录
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤 5：完成（登录成功） */}
            {currentStep === 5 && (
              <div className="flex-1 flex flex-col justify-center animate-slide-up">
                <div className="text-center">
                  {/* Logo */}
                  <div className="flex justify-center mb-4">
                    <div className="scale-90">
                      <EyeLogo />
                    </div>
                  </div>

                  <div className="text-7xl mb-6 animate-bounce">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {authMode === 'signup' ? '注册成功！' : '登录成功！'}
                  </h2>
                  <p className="text-white/70 text-lg mb-8">
                    欢迎加入 PrimeSight 大家庭！
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10">
                    <p className="text-white/80 text-sm mb-1">你的账号</p>
                    <p className="text-white font-semibold">{email}</p>
                  </div>

                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  >
                    开始使用 PrimeSight 🚀
                  </button>
                </div>
              </div>
            )}

            {/* 步骤指示器 */}
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index + 1 === currentStep
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                      : index + 1 < currentStep
                      ? 'w-1.5 bg-white/50'
                      : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
