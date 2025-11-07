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

  // 检查环境变量是否存在
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '❌ Supabase 环境变量未配置！\n' +
      '请在 Vercel 项目设置中添加以下环境变量：\n' +
      '1. NEXT_PUBLIC_SUPABASE_URL\n' +
      '2. NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      '详情请查看 .env.local 文件中的配置示例'
    );
  }

  return createBrowserClient(
    supabaseUrl, // Supabase 项目 URL
    supabaseAnonKey // Supabase 匿名密钥
  )
}

// 导出一个单例客户端，避免重复创建
export const supabase = createClient()
