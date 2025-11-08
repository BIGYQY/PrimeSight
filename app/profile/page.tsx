"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();

  // 用户数据
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

  // 表单数据
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 状态
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * 加载用户资料
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 1. 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        setEmail(user.email || '');

        // 2. 获取用户 profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('获取 profile 失败:', error);
          // 如果没有 profile，设置默认值
          if (error.code === 'PGRST116') {
            // PGRST116 = 找不到记录
            console.log('用户还没有 profile，将创建新的');
            setDisplayName(user.email?.split('@')[0] || '');
          }
        } else if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name);
          setAvatarPreview(profileData.avatar_url);
        }
      } catch (err) {
        console.error('加载资料失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  /**
   * 处理头像文件选择
   */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
      }

      // 检查文件大小（最大 2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB！');
        return;
      }

      setAvatarFile(file);

      // 生成预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 保存资料
   */
  const handleSave = async () => {
    console.log('开始保存，profile:', profile);

    // 验证昵称
    if (!displayName.trim()) {
      alert('昵称不能为空！');
      return;
    }

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('未登录，请先登录！');
      return;
    }

    setIsSaving(true);

    try {
      let avatarUrl = profile?.avatar_url || null;

      // 如果选择了新头像，先上传
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // 上传到 Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true, // 如果存在则覆盖
          });

        if (uploadError) {
          console.error('上传头像失败:', uploadError);
          alert('上传头像失败，请重试！');
          setIsSaving(false);
          return;
        }

        // 获取公开 URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = urlData.publicUrl;
      }

      // 更新或创建 profile（使用 upsert）
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('保存资料失败:', upsertError);
        alert(`保存失败：${upsertError.message}`);
        setIsSaving(false);
        return;
      }

      alert('✅ 资料已保存！');
      router.push('/dashboard');
    } catch (err) {
      console.error('保存过程出错:', err);
      alert('保存失败，请重试！');
      setIsSaving(false);
    }
  };

  /**
   * 获取头像显示
   */
  const getAvatarDisplay = () => {
    if (avatarPreview) {
      return (
        <img
          src={avatarPreview}
          alt="头像"
          className="w-32 h-32 rounded-full object-cover"
        />
      );
    } else {
      // 字母头像
      const letter = email ? email[0].toUpperCase() : 'U';
      return (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold">
          {letter}
        </div>
      );
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
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 顶部标题 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">个人资料</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
          >
            返回
          </button>
        </div>

        {/* 资料卡片 */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          {/* 头像区域 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {getAvatarDisplay()}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all shadow-lg"
              >
                <span className="text-white text-xl">📷</span>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-white/60 text-sm">点击相机图标上传头像（最大 2MB）</p>
          </div>

          {/* 邮箱（只读） */}
          <div className="mb-6">
            <label className="block text-white/70 mb-2 text-sm font-medium">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
            />
          </div>

          {/* 昵称 */}
          <div className="mb-6">
            <label className="block text-white/70 mb-2 text-sm font-medium">
              昵称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="请输入昵称..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* 保存按钮 */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  保存中...
                </>
              ) : (
                '💾 保存'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
