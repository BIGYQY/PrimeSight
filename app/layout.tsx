import type { Metadata } from "next";
import "./globals.css";

// 网站元数据（SEO 相关）
export const metadata: Metadata = {
  title: "PrimeSight - 顶级视野问卷调查平台",
  description: "追求卓越的问卷调查平台，让每一份问卷都有价值",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50">
        {/* children 就是每个页面的内容 */}
        {children}
      </body>
    </html>
  );
}
