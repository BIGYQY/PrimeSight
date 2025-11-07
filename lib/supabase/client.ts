// Supabase 客户端工具文件
// 这个文件用于在客户端组件（"use client"）中连接 Supabase

import { createBrowserClient } from '@supabase/ssr'

/**
 * 创建 Supabase 客户端
 * 这个客户端可以在所有的客户端组件中使用
 *
 * @returns Supabase 客户端实例
 */
export function createClient() {
  // 从环境变量中读取 Supabase 配置
  // NEXT_PUBLIC_ 前缀的环境变量可以在浏览器中访问
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 调试输出（帮助排查问题）
  console.log('🔍 Supabase 配置检查:');
  console.log('  URL:', supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : '❌ 未定义');
  console.log('  KEY:', supabaseAnonKey ? `${supabaseAnonKey.slice(0, 20)}...` : '❌ 未定义');

  // 检查环境变量是否存在
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage =
      '❌ Supabase 环境变量未配置！\n' +
      '请在 Vercel 项目设置中添加以下环境变量：\n' +
      '1. NEXT_PUBLIC_SUPABASE_URL\n' +
      '2. NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      '\n当前值:\n' +
      `URL: ${supabaseUrl || '未定义'}\n` +
      `KEY: ${supabaseAnonKey || '未定义'}`;

    console.error(errorMessage);
    alert(errorMessage); // 直接弹窗显示错误
    throw new Error(errorMessage);
  }

  // 验证 URL 格式
  if (!supabaseUrl.startsWith('https://')) {
    const errorMessage = `❌ Supabase URL 格式错误：${supabaseUrl}\n应该以 https:// 开头`;
    console.error(errorMessage);
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  return createBrowserClient(
    supabaseUrl, // Supabase 项目 URL
    supabaseAnonKey // Supabase 匿名密钥
  )
}

// 导出一个单例客户端，避免重复创建
export const supabase = createClient()
