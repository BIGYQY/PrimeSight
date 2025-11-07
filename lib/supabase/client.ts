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
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // Supabase 项目 URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Supabase 匿名密钥
  )
}

// 导出一个单例客户端，避免重复创建
export const supabase = createClient()
